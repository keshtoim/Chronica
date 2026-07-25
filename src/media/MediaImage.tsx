import { useEffect, useState } from 'react'
import { mediaRepository } from '@/data/repositories/mediaRepository'

interface Props {
  blobKey: string
  className?: string
  alt?: string
}

/** Резолвит blobKey из Dexie в object URL и рендерит <img>. Освобождает URL при размонтировании/смене ключа. */
export function MediaImage({ blobKey, className, alt = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | undefined
    let cancelled = false

    void mediaRepository.get(blobKey).then((blob) => {
      if (cancelled || !blob) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blobKey])

  if (!url) return null
  return <img src={url} alt={alt} className={className} />
}
