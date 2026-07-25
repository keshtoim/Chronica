import { useRef, useState, type ChangeEvent } from 'react'
import { mediaRepository } from '@/data/repositories/mediaRepository'
import { ImageCropModal } from '@/media/ImageCropModal'
import { MediaImage } from '@/media/MediaImage'
import type { MediaRef } from '@/data/entities'

interface Props {
  value?: MediaRef
  /** Соотношение сторон рамки кадрирования (ширина/высота). */
  aspect?: number
  onChange: (ref: MediaRef | undefined) => void
  label?: string
  thumbnailClassName?: string
}

export function PhotoPicker({
  value,
  aspect = 1,
  onChange,
  label = 'Фото',
  thumbnailClassName,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPendingSrc(URL.createObjectURL(file))
  }

  async function handleConfirm(blob: Blob) {
    const previousKey = value?.blobKey
    const blobKey = await mediaRepository.store(blob)
    if (pendingSrc) URL.revokeObjectURL(pendingSrc)
    setPendingSrc(null)
    onChange({ blobKey })
    if (previousKey) await mediaRepository.remove(previousKey)
  }

  function handleCancel() {
    if (pendingSrc) URL.revokeObjectURL(pendingSrc)
    setPendingSrc(null)
  }

  async function handleRemove() {
    if (value?.blobKey) await mediaRepository.remove(value.blobKey)
    onChange(undefined)
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileSelected} />

      {value && (
        <MediaImage
          blobKey={value.blobKey}
          alt={label}
          className={thumbnailClassName ?? 'h-10 w-10 rounded-md object-cover'}
        />
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface-hover)]"
      >
        {value ? `Изменить ${label.toLowerCase()}` : `Добавить ${label.toLowerCase()}`}
      </button>

      {value && (
        <button
          type="button"
          onClick={() => void handleRemove()}
          className="text-xs text-[var(--color-danger)] hover:underline"
        >
          Удалить
        </button>
      )}

      {pendingSrc && (
        <ImageCropModal
          imageSrc={pendingSrc}
          aspect={aspect}
          onCancel={handleCancel}
          onConfirm={(blob) => void handleConfirm(blob)}
        />
      )}
    </div>
  )
}
