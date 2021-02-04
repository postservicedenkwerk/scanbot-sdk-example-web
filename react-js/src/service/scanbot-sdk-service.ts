
// Import SDK from webpack directory to ensure web assembly binary and worker and bundled with webpack
import ScanbotSDK from "scanbot-web-sdk/webpack";

// Other typings should be imported from @types
import {ICroppingViewHandle} from "scanbot-web-sdk/@types/interfaces/i-cropping-view-handle";
import {DocumentScannerConfiguration} from "scanbot-web-sdk/@types/model/configuration/document-scanner-configuration";
import {IDocumentScannerHandle} from "scanbot-web-sdk/@types/interfaces/i-document-scanner-handle";
import {FilterType} from "scanbot-web-sdk/@types/model/filter-types";
import Pages from "../model/Pages";

export class ScanbotSdkService {

    static DOCUMENT_SCANNER_CONTAINER = "document-scanner-view";
    static CROPPING_VIEW_CONTAINER = "cropping-view";

    public static instance = new ScanbotSdkService();

    license = "";

    sdk?: ScanbotSDK;
    documentScanner?: IDocumentScannerHandle;
    croppingView?: ICroppingViewHandle;

    public async initialize() {
        this.sdk = await ScanbotSDK.initialize({licenseKey: this.license, engine: "/"});
        return this.sdk;
    }

    public async createDocumentScanner(detectionCallback: any) {
        const config: DocumentScannerConfiguration = {
            onDocumentDetected: detectionCallback,
            containerId: ScanbotSdkService.DOCUMENT_SCANNER_CONTAINER
        };

        if (this.sdk) {
            this.documentScanner = await this.sdk!.createDocumentScanner(config);
        }
    }

    public disposeDocumentScanner() {
        this.documentScanner?.dispose();
    }

    public async openCroppingView(page: any) {
        const configuration = {containerId: ScanbotSdkService.CROPPING_VIEW_CONTAINER, image: page.original, polygon:page.polygon};

        this.croppingView = await this.sdk!.openCroppingView(configuration);
    }

    public disposeCroppingView() {
        this.croppingView?.dispose();
    }

    public binarizationFilters() {
        return [
            'binarized',
            'otsuBinarization',
            'pureBinarized',
            'lowLightBinarization',
            'lowLightBinarization2',
            'deepBinarization'
        ];
    }

    public colorFilters() {
        return [
            'color',
            'gray',
            'colorDocument',
            'blackAndWhite',
            'edgeHighlight',
            'trinarization',
            'lightMapNormalization'
        ];
    }

    public availableFilters() {
        return this.binarizationFilters().concat(this.colorFilters());
    }
    filterByIndex(value: string) {
        return this.availableFilters()[parseInt(value)];
    }

    public async applyFilter(image: ArrayBuffer, filter: FilterType) {
        return await this.sdk!.applyFilter(image, filter);
    }

    async documentImageAsBase64(index: number) {
        const bytes = Pages.instance.imageAtIndex(index);
        if (bytes) {
            return await this.sdk!.toDataUrl(bytes);
        }
    }

}
