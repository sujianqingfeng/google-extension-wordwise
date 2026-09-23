export const CONTENT_MESSAGE_TYPE = {
	SHOW_SIDEBAR: "show_sidebar",
}

export const CUSTOM_EVENT_TYPE = {
	RANGE_WORDS: "range_words",
	RANGE_WORDS_REMOVE: "range_words_remove",
	MASK_CLICK_EVENT: "mask_click_event",
	TYPOGRAPHY_HOVER: "typography_hover",
}

export const ENABLE_TAG_ELEMENTS = ["div", "section", "main", "article"]
// shared by range masking + typography hover; kept lowercase
export const EXCLUDE_TAG_ELEMENTS = [
	"script",
	"style",
	"noscript",
	"template",
	"svg",
	"img",
	"picture",
	"canvas",
	"video",
	"audio",
	"iframe",
	"input",
	"textarea",
	"datalist",
	"select",
	"option",
	"button",
	"nav",
	"table",
	"pre",
]

// name the marked words are registered under in CSS.highlights; words are
// painted as ranges, never as injected elements
export const HIGHLIGHT_NAME = "word-wise"

// attribute put on the element under a marked word — a highlight pseudo-element
// cannot carry `cursor`, and the query panel's outside-click check needs a way
// to tell a word click from a click elsewhere on the page
export const MASK_HOVER_ATTR = "data-word-wise-hover"

export const TOKEN = "local:token"
export const REFRESH_TOKEN = "local:refresh-token"

export const QUERY_SHADOW_TAG_NAME = "word-wise-query"
export const SIDEBAR_SHADOW_TAG_NAME = "word-wise-sidebar"
