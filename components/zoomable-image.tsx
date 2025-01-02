'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ZoomableImageProps {
  src: string
  alt: string
  width: number
  height: number
}

export function ZoomableImage ({ src, alt, width, height }: Readonly<ZoomableImageProps>) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onClick={() => setIsZoomed(true)}
        className="cursor-pointer"
      />
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative">
            <Image
              src={src}
              alt={alt}
              width={width * 1.5}
              height={height * 1.5}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setIsZoomed(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
