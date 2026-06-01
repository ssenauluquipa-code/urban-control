export class PdfViewerUtil{

    public static preview(blob : Blob): void {
        if(!blob) return;

        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');
        if(!newWindow){
            console.warn('El navegador bloqueó la apertura automática del PDF.');
        }
    }
}