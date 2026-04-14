export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
  const downloadFromUrl = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (canvas.toBlob) {
    canvas.toBlob((blob) => {
      if (!blob) {
        downloadFromUrl(canvas.toDataURL('image/png'));
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      downloadFromUrl(objectUrl);
      URL.revokeObjectURL(objectUrl);
    }, 'image/png');
    return;
  }

  downloadFromUrl(canvas.toDataURL('image/png'));
}
