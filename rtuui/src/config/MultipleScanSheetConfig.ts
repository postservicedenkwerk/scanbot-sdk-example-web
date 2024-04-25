
/**
 * This code snippet is to be used only as a part of the website documentation.
 * It is not intended for any use outside of the support of documentation by Scanbot SDK GmbH employees.
 * 
 * For maintainers: whenever changing this code, ensure that links using it are still pointing to valid lines!
 */

import {
    BarcodeScannerConfiguration,
    MultipleScanningMode
} from "scanbot-web-sdk/@types/ui2/configuration";

export function applySheetMode(config: BarcodeScannerConfiguration) {

    const useCase = config.useCase as MultipleScanningMode;

    useCase.sheet.mode = "COLLAPSED_SHEET"

    // Set the height for the collapsed sheet.
    useCase.sheet.collapsedVisibleHeight = "LARGE"

    // Configure the submit button on the sheet.
    useCase.sheetContent.submitButton.text = "Submit"
    useCase.sheetContent.submitButton.foreground.color = "#000000"
}