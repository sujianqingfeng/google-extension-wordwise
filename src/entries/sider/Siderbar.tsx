import { useEffect } from 'react'
import SideHeader from './SideHeader'
import { createBackgroundMessage } from '../../messaging/background'

interface SideProps {
  removeSidebar: () => void
}

export default function Sidebar(props: SideProps) {
  useEffect(() => {
    const fetchInfo = async () => {
      const bgs = createBackgroundMessage()
      const user = await bgs.getUser()
      console.log('🚀 ~ fetchInfo ~ user:', user)
    }

    fetchInfo()
  }, [])

  return (
    <div className="fixed top-0 right-0 bottom-0 z-9999 w-[300px] bg-base shadow-sm">
      <SideHeader onClose={props.removeSidebar} />
    </div>
  )
}
