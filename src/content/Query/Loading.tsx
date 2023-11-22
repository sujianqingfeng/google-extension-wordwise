import Spinner from '../../assets/spinner.svg?react'

export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center p-2">
      <Spinner height={30} width={30} />
    </div>
  )
}
