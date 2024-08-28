import Loading from "@/components/Loading"
import { ErrorBoundary, type FallbackProps } from "react-error-boundary"
import { WandSparkles, Volume2 } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createBackgroundMessage } from "@/messaging/background"
import { onBackgroundMessage, sendBackgroundMessage } from "@/messaging/content"
import { useEffect, useRef, useState } from "react"
import Analyze from "./Analyze"

type TranslateTextProps = {
  text: string
}

const bgs = createBackgroundMessage()

function TranslateText({ text }: TranslateTextProps) {
  const { data: translateResult } = useSuspenseQuery({
    queryKey: ["translate", text],
    queryFn: () => bgs.fetchAiTranslate({ text, provider: "deepSeek" }),
  })
  const [analyzeResult, setAnalyzeResult] = useState("")
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const removeCallback = useRef<() => void>()

  const onAnalyze = async () => {
    setAnalyzeLoading(true)
    sendBackgroundMessage("analyzeGrammar", text)
  }

  const onSystemTTS = () => {
    const msg = new SpeechSynthesisUtterance(text)
    msg.lang = "en-GB"
    msg.rate = 0.6
    window.speechSynthesis.speak(msg)
  }

  useEffect(() => {
    if (analyzeLoading) {
      removeCallback.current = onBackgroundMessage(
        "analyzeGrammarResult",
        ({ data: { result, done } }) => {
          setAnalyzeResult(result)
          setAnalyzeLoading(!done)
        },
      )
    }

    return () => {
      removeCallback.current?.()
    }
  }, [analyzeLoading])

  return (
    <div className="text-sm font-normal dark:text-gray-400 text-black">
      <div className="px-2 pb-2">
        <div className="mt-2">{text}</div>
        <div className="mt-2">{translateResult}</div>
      </div>
      <Analyze result={analyzeResult} />
      <div className="px-2 py-1 flex justify-end bg-gray-100 dark:bg-slate-400/10 gap-2">
        <Volume2
          onClick={onSystemTTS}
          size={15}
          className="cursor-pointer dark:text-gray-400 text-black"
        />

        {analyzeLoading ? (
          <Loading size={14} />
        ) : (
          <WandSparkles
            size={14}
            className="cursor-pointer dark:text-gray-400 text-black"
            onClick={onAnalyze}
          />
        )}
      </div>
    </div>
  )
}

function fallbackRender({ error }: FallbackProps) {
  return (
    <div className="p-2">
      <p>Something went wrong:</p>
      <pre className="text-red">{error.message}</pre>
    </div>
  )
}

function TranslateTextErrorWrapper({ text }: TranslateTextProps) {
  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <TranslateText text={text} />
    </ErrorBoundary>
  )
}

export default TranslateTextErrorWrapper
