'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';
import { useUploadThing } from '@/lib/uploadthing';

const MAX_SIDE = 1024;

/** Reduz a foto (celulares tiram fotos de vários MB) e a converte em JPEG leve. */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ? new File([blob], 'foto.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

interface EmployeeAvatarFieldProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Avisa se há envio em andamento (para segurar o botão de salvar). */
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

export function EmployeeAvatarField({
  value,
  onChange,
  onUploadingChange,
  disabled,
}: EmployeeAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const setUploading = (uploading: boolean) => {
    setBusy(uploading);
    onUploadingChange?.(uploading);
  };

  const { startUpload } = useUploadThing('employeeAvatar', {
    onClientUploadComplete: (files) => {
      const uploaded = files[0];
      const url = uploaded?.serverData?.url ?? uploaded?.ufsUrl;
      if (url) onChange(url);
      setUploading(false);
    },
    onUploadError: (error) => {
      setUploading(false);
      toastError(`Não foi possível enviar a foto: ${error.message}`);
    },
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastError('Escolha uma imagem.');
      return;
    }
    setUploading(true);
    try {
      await startUpload([await shrinkImage(file)]);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {value && <AvatarImage src={value} alt="Foto do colaborador" />}
        <AvatarFallback className="bg-primary/10 text-primary">
          <User className="size-7" />
        </AvatarFallback>
      </Avatar>

      {!disabled && (
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Camera className="mr-1.5 size-3.5" />
            )}
            {busy ? 'Enviando...' : value ? 'Trocar foto' : 'Enviar foto'}
          </Button>
          {value && !busy && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Remover
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
