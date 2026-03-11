'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

type Area = { x: number; y: number; width: number; height: number }

interface ImageCropperProps {
  imageSrc: string
  cropShape: 'round' | 'rect'
  aspect: number
  onCropDone: (croppedBlob: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ imageSrc, cropShape, aspect, onCropDone, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleDone = async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels)
    onCropDone(blob)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm mx-4">
        <div className="relative h-72 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 accent-violet-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 btn-secondary py-2 text-sm">
              Cancel
            </button>
            <button onClick={handleDone} className="flex-1 btn-primary py-2 text-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

async function getCroppedImage(imageSrc: string, crop: Area): Promise<Blob> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create blob'))
    }, 'image/jpeg', 0.9)
  })
}
