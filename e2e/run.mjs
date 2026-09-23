/**
 * End-to-end test for the wordwise masking pipeline.
 *
 * Builds the extension with WORDWISE_DEV_MOCK=1 (which compiles in the mock
 * account, so no real login is needed), installs it into the
 * chrome-devtools-mcp managed Chrome, then asserts the masking scenarios
 * against e2e/fixture/index.html: initial masking, SPA view swaps, history
 * back, in-place text rewrites, pushState navigation, scroll-triggered lazy
 * masking, mutation churn (debounce maxWait), mid-session word additions and
 * — the regression that drove the switch to the highlight registry — a
 * page-owned text node whose updates must still render while it is marked.
 *
 * The e2e build overwrites output/chrome-mv3; a production build is restored
 * at the end. Requires the `chrome-devtools` CLI on PATH.
 *
 * Usage: pnpm test:e2e
 */
import { spawnSync } from "node:child_process"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const CLI = "chrome-devtools"
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BUILD_DIR = path.join(ROOT, "output", "chrome-mv3")
const FIXTURE_DIR = path.join(ROOT, "e2e", "fixture")

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function cli(args, { json = true } = {}) {
	const result = spawnSync(
		CLI,
		json ? [...args, "--output-format=json"] : args,
		{
			encoding: "utf8",
			cwd: ROOT,
		},
	)
	const output = `${result.stdout ?? ""}${result.stderr ?? ""}`
	if (result.status !== 0 && !output) {
		throw new Error(`chrome-devtools ${args[0]} failed: ${result.error}`)
	}
	return output
}

// the CLI may print update notices before the payload; scan from the end for
// the last line that parses as JSON
function cliJson(args) {
	const output = cli(args)
	const lines = output
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i]
		if (line.startsWith("[") || line.startsWith("{")) {
			try {
				return JSON.parse(line)
			} catch {
				// keep scanning
			}
		}
	}
	return output
}

// this CLI version wraps the result in a markdown fence inside {message};
// the fence holds the JSON-serialized return value of the page function
function evalJs(body) {
	const payload = cliJson(["evaluate_script", `() => { return (${body}) }`])
	const text = Array.isArray(payload)
		? payload[0]?.text
		: (payload?.text ?? payload?.message ?? "")
	const fence = text.match(/```json\n([\s\S]*?)\n```/)?.[1] ?? text
	try {
		const value = JSON.parse(fence)
		return typeof value === "string" ? JSON.parse(value) : value
	} catch {
		return fence
	}
}

// the managed profile assigns a stable id per install path and reinstalls
// happily, so the id is simply parsed back out of the install result
function installExtension() {
	const output = cliJson(["install_extension", BUILD_DIR])
	const serialized =
		typeof output === "string" ? output : JSON.stringify(output)
	const id = serialized.match(/Id:\s*([a-p]{32})/)?.[1]
	if (!id) {
		throw new Error(`extension install failed or returned no id: ${serialized}`)
	}
	return id
}

async function serveFixture() {
	const server = createServer(async (req, res) => {
		try {
			const file = await readFile(path.join(FIXTURE_DIR, "index.html"))
			res.writeHead(200, { "content-type": "text/html; charset=utf-8" })
			res.end(file)
		} catch {
			res.writeHead(404)
			res.end()
		}
	})
	const port = await new Promise((resolve, reject) => {
		server.once("error", reject)
		server.listen(0, "127.0.0.1", () => {
			resolve(server.address().port)
		})
	})
	return { server, url: `http://127.0.0.1:${port}/index.html` }
}

async function waitFor(name, probe, timeoutMs = 8000, intervalMs = 300) {
	const deadline = Date.now() + timeoutMs
	let last
	while (Date.now() < deadline) {
		last = await probe()
		if (last.ok) {
			return last
		}
		await sleep(intervalMs)
	}
	throw new Error(`timeout waiting for "${name}": ${JSON.stringify(last)}`)
}

// marks live in CSS.highlights as ranges, not as elements — the page's main
// world can read the registry directly
const maskInfo = (selector) =>
	`JSON.stringify((root => {
		const registry = CSS.highlights.get('word-wise')
		const ranges = registry ? [...registry].filter(r => root.contains(r.startContainer)) : []
		return {
			total: ranges.length,
			words: ranges.map(r => r.toString().toLowerCase()),
			injectedElements: document.querySelectorAll('[data-word-wise]').length,
		}
	})(${selector}))`

async function run() {
	// ---- setup -------------------------------------------------------------
	exec("npx", ["wxt", "build"], "mock-mode build", { WORDWISE_DEV_MOCK: "1" })
	cli(["stop"])
	cli(["start", "--categoryExtensions=true"])
	await sleep(1000)

	const expectedId = installExtension()

	const { server, url } = await serveFixture()
	cli(["new_page", url])
	await sleep(1000)

	// ---- assertions --------------------------------------------------------
	const results = []
	const check = async (name, fn) => {
		try {
			await fn()
			results.push({ name, ok: true })
			console.log(`  ✓ ${name}`)
		} catch (error) {
			results.push({ name, ok: false, error: String(error.message ?? error) })
			console.error(`  ✗ ${name}\n    ${error.message ?? error}`)
		}
	}

	const expectMasks = (name, body, minTotal, extra = {}) =>
		waitFor(name, async () => {
			const info = await evalJs(body)
			return {
				ok: info.total >= minTotal,
				...extra,
				...info,
			}
		})

	await check("页面加载后初始打标（列表+异步段落 ≥ 11 处）", async () => {
		const info = await expectMasks("initial", maskInfo("document"), 11)
		for (const word of ["panda", "river", "mountain", "ancient", "discover"]) {
			if (!info.words.includes(word)) {
				throw new Error(`word not masked on load: ${word} in ${info.words}`)
			}
		}
		// the whole point of the highlight registry: marking injects nothing
		if (info.injectedElements !== 0) {
			throw new Error(
				`marking injected ${info.injectedElements} element(s) into the page`,
			)
		}
	})

	await check(
		"点击查看详情：DOM 整体替换后新视图自动打标（≥ 6 处）",
		async () => {
			await evalJs(`document.getElementById('btn-detail').click()`)
			await expectMasks(
				"detail swap",
				maskInfo("document.getElementById('detail-view')"),
				6,
			)
		},
	)

	await check("点击返回列表：重新渲染的列表恢复打标（≥ 10 处）", async () => {
		await evalJs(`document.getElementById('btn-back').click()`)
		await expectMasks(
			"list re-render",
			maskInfo("document.getElementById('list-view')"),
			10,
		)
	})

	await check("文本原地更新（nodeValue）：改写后标记跟着重算", async () => {
		await evalJs(`document.getElementById('btn-inplace').click()`)
		await waitFor("in-place update", async () => {
			const info = await evalJs(`JSON.stringify({
					text: document.getElementById('char-update').textContent,
					loaded: (() => {
						const r = CSS.highlights.get('word-wise')
						return r ? [...r].filter(x => document.getElementById('char-update').contains(x.startContainer)).map(x => x.toString().toLowerCase()) : []
					})()
				})`)
			// the rewrite dropped "began"/"spring"/"cold" and added
			// "ancient"; ranges built from the old text must be gone
			return {
				ok: info.loaded.includes("ancient") && info.loaded.length === 3,
				...info,
			}
		})
	})

	await check("pushState 路由跳转：详情视图打标（≥ 6 处）", async () => {
		await evalJs(`document.getElementById('btn-push').click()`)
		await expectMasks(
			"pushState detail",
			maskInfo("document.getElementById('detail-view')"),
			6,
		)
	})

	await check("浏览器后退（popstate）：列表重新打标（≥ 10 处）", async () => {
		cli(["navigate_page", "--type", "back"], { json: false })
		await expectMasks(
			"popstate list",
			maskInfo("document.getElementById('list-view')"),
			10,
		)
	})

	await check(
		"滚动到视口外内容：IntersectionObserver 懒打标（≥ 3 处）",
		async () => {
			await evalJs(`window.scrollTo(0, document.body.scrollHeight)`)
			await expectMasks(
				"deep section",
				maskInfo("document.getElementById('deep-view')"),
				3,
			)
		},
	)

	await check("持续 DOM 变异：maxWait 强制 flush 补标（≥ 3 处）", async () => {
		// the page is scrolled to the bottom from the previous step; bring the
		// live log into view or the IntersectionObserver correctly won't mask
		await evalJs(`window.startChurn()`)
		await evalJs(`document.getElementById('churn-view').scrollIntoView()`)
		await sleep(2500)
		const state = await evalJs(`JSON.stringify(window.churnState())`)
		await evalJs(`window.stopChurn()`)
		if (!state.running || state.masks < 3) {
			throw new Error(
				`churn masks=${state.masks} after ${state.count} inserts (running=${state.running})`,
			)
		}
	})

	await check("中途加词（range_words 事件）：新词立即打标", async () => {
		await evalJs(
			`document.dispatchEvent(new CustomEvent('range_words', { detail: ['bulletin', 'newborn'] }))`,
		)
		await waitFor("added words", async () => {
			const info = await evalJs(`JSON.stringify(
				(() => {
					const registry = CSS.highlights.get('word-wise')
					const words = registry ? [...registry].map(r => r.toString().toLowerCase()) : []
					return {
						total: words.length,
						added: words.filter(w => w === 'bulletin' || w === 'newborn').length,
					}
				})()
			)`)
			return { ok: info.added >= 2, ...info }
		})
	})

	await check(
		"框架持有文本节点引用时，页面自己的更新仍然生效（回归）",
		async () => {
			const before = await evalJs(
				`JSON.stringify(window.frameworkToggleState())`,
			)
			if (!before.heldNodeStillRendered) {
				throw new Error(
					"marking detached the text node the page holds a reference to",
				)
			}

			await evalJs(`document.getElementById('btn-framework-toggle').click()`)
			await sleep(600)
			const translated = await evalJs(
				`JSON.stringify(window.frameworkToggleState())`,
			)
			if (!translated.heldNodeStillRendered) {
				throw new Error("the held node was detached by the toggle")
			}
			if (translated.text === before.text) {
				throw new Error(
					`page's own text update never rendered: ${JSON.stringify(translated)}`,
				)
			}
			if (translated.label === before.label) {
				throw new Error("the toggle label did not update")
			}

			// switching back must restore the original text *and* its marks
			await evalJs(`document.getElementById('btn-framework-toggle').click()`)
			await sleep(600)
			const restored = await evalJs(
				`JSON.stringify(window.frameworkToggleState())`,
			)
			if (restored.text !== before.text) {
				throw new Error(
					`text did not come back: ${JSON.stringify(restored.text.slice(0, 40))}`,
				)
			}
			const marks = await evalJs(
				maskInfo(`document.getElementById('framework-view')`),
			)
			if (marks.total < 5) {
				throw new Error(
					`marks lost after the framework re-rendered: ${JSON.stringify(marks)}`,
				)
			}
		},
	)

	return { results, server, pageUrl: url, extensionId: expectedId }
}

function exec(cmd, args, label, env = {}) {
	const result = spawnSync(cmd, args, {
		encoding: "utf8",
		cwd: ROOT,
		env: { ...process.env, ...env },
	})
	if (result.status !== 0) {
		throw new Error(`${label} failed:\n${result.stdout}\n${result.stderr}`)
	}
	console.log(`  · ${label} ok`)
}

async function cleanup(extensionId, server, _pageUrl) {
	console.log("\ncleanup:")
	try {
		server?.close()
	} catch {}
	try {
		cli(["uninstall_extension", extensionId])
		console.log("  · extension uninstalled")
	} catch {}
	try {
		const listing = cliJson(["list_pages"])
		const pages = Array.isArray(listing) ? listing : (listing?.pages ?? [])
		let closed = 0
		for (const page of pages) {
			if (String(page?.url ?? "").includes("127.0.0.1")) {
				cli(["close_page", String(page.id)])
				closed += 1
			}
		}
		console.log(`  · ${closed} test page(s) closed`)
	} catch {}
	try {
		exec("npx", ["wxt", "build"], "production build restore")
	} catch (error) {
		console.error(`  ! ${error.message}`)
	}
}

async function main() {
	if (!spawnSync(CLI, ["--version"], { encoding: "utf8" }).stdout) {
		throw new Error(
			"chrome-devtools CLI not found on PATH — see e2e/run.mjs header for setup",
		)
	}

	console.log("wordwise e2e\n")
	let outcome
	try {
		outcome = await run()
	} finally {
		await cleanup(outcome?.extensionId, outcome?.server, outcome?.pageUrl)
	}

	const results = outcome?.results ?? []
	const failed = results.filter((r) => !r.ok)
	console.log(`\n${results.length - failed.length}/${results.length} passed`)
	if (failed.length > 0) {
		process.exit(1)
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
