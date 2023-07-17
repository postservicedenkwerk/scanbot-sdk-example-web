const results = [];
let scanbotSDK, documentScanner, barcodeScanner, mrzScanner, croppingView;

window.onresize = () => {
  this.resizeContent();
};

window.onload = async () => {
  this.resizeContent();

  Utils.getElementByClassName("document-scanner-button").onclick = async (
    e
  ) => {
    Utils.getElementByClassName("scanbot-camera-controller").style.display =
      "block";

    const config = {
      containerId: Config.scannerContainerId(),
      acceptedAngleScore: 60,
      acceptedSizeScore: 60,
      autoCaptureSensitivity: 0.66,
      autoCaptureEnabled: true,
      ignoreBadAspectRatio: false,
      onDocumentDetected: onDocumentDetected,
      onError: onScannerError,
      text: {
        hint: {
          OK: "Capturing your document...",
          OK_SmallSize: "The document is too small. Try moving closer.",
          OK_BadAngles:
            "This is a bad camera angle. Hold the device straight over the document.",
          OK_BadAspectRatio:
            "Rotate the device sideways, so that the document fits better into the screen.",
          OK_OffCenter: "Try holding the device at the center of the document.",
          Error_NothingDetected:
            "Please hold the device over a document to start scanning.",
          Error_Brightness: "It is too dark. Try turning on a light.",
          Error_Noise: "Please move the document to a clear surface.",
        },
      },
      preferredCamera: 'camera2 0, facing back'
    };

    try {
      documentScanner = await scanbotSDK.createDocumentScanner(config);
    } catch (e) {
      console.log(e.name + ': ' + e.message);
      alert(e.name + ': ' + e.message);
      Utils.getElementByClassName("scanbot-camera-controller").style.display = "none";
    }
  };

  Utils.getElementByClassName("detection-done-button").onclick = async (e) => {
    documentScanner.dispose();
    Utils.getElementByClassName("scanbot-camera-controller").style.display =
      "none";
    Utils.getElementByClassName("detection-results-controller").style.display =
      "block";

    await reloadDetectionResults();
  };

  Utils.getElementByClassName("crop-button").onclick = async (e) => {
    Utils.getElementByClassName("detection-result-controller").style.display =
      "none";
    Utils.getElementByClassName("cropping-controller").style.display = "block";

    const index = Utils.getElementByClassName(
      "detection-result-image"
    ).getAttribute("index");

    let rotations = results[index].rotations;
    if (!rotations) {
      rotations = 0;
    }

    const options = {
      containerId: Config.croppingViewContainerId(),
      image: results[index].original,
      polygon: results[index].polygon,
      rotations: rotations,
      disableScroll: true,
      style: {
        padding: 20,
        polygon: {
          color: "green",
          width: 4,
          handles: {
            size: 14,
            color: "white",
            border: "1px solid lightgray",
          },
        },
        magneticLines: {
          // disabled: true,
          color: "red",
        },
      },
    };
    croppingView = await scanbotSDK.openCroppingView(options);
  };

  Utils.getElementByClassName("delete-button").onclick = async (e) => {
    const index = Utils.getElementByClassName(
      "detection-result-image"
    ).getAttribute("index");

    results.splice(index, 1);

    const controller =
      e.target.parentElement.parentElement.parentElement.className;
    Utils.getElementByClassName(controller).style.display = "none";

    Utils.getElementByClassName(
      "detection-results-controller"
    ).style.display = "block";

    await reloadDetectionResults();
  };

  Utils.getElementByClassName("barcode-scanner-button").onclick = async (e) => {
    Utils.getElementByClassName("barcode-scanner-controller").style.display = "block";

    const config = Config.barcodeScannerConfig();
    config.containerId = Config.barcodeScannerContainerId();
    config.onBarcodesDetected = onBarcodesDetected;
    config.onError = onScannerError;

    try {
      barcodeScanner = await scanbotSDK.createBarcodeScanner(config);
    } catch (e) {
      console.log(e.name + ': ' + e.message);
      alert(e.name + ': ' + e.message);
      Utils.getElementByClassName("barcode-scanner-controller").style.display = "none";
    }
  };

  Utils.getElementByClassName("barcode-scanner-overlay-button").onclick = async (e) => {
    Utils.getElementByClassName("barcode-scanner-overlay-controller").style.display = "block";

    const config = Config.barcodeScannerConfig();
    config.containerId = Config.barcodeScannerOverlayContainerId();
    config.onBarcodesDetected = () => {

    };
    config.onError = onScannerError;
    config.overlay = { visible: true };
    config.showFinder = false;

    try {
      barcodeScanner = await scanbotSDK.createBarcodeScanner(config);
    } catch (e) {
      console.log(e.name + ': ' + e.message);
      alert(e.name + ': ' + e.message);
      Utils.getElementByClassName("barcode-scanner-overlay-controller").style.display = "none";
    }
  };

  Utils.getElementByClassName("mrz-scanner-button").onclick = async (e) => {
    Utils.getElementByClassName("mrz-scanner-controller").style.display =
      "block";

    const config = {
      containerId: Config.mrzScannerContainerId(),
      onMrzDetected: onMrzDetected,
      onError: onScannerError,
      preferredCamera: 'camera2 0, facing back'
    };

    try {
      mrzScanner = await scanbotSDK.createMrzScanner(config);
    } catch (e) {
      console.log(e.name + ': ' + e.message);
      alert(e.name + ': ' + e.message);
      Utils.getElementByClassName("mrz-scanner-controller").style.display = "none";
    }
  };

  Utils.getElementByClassName("text-data-scanner-button").onclick = async (e) => {
    Utils.getElementByClassName("text-data-scanner-controller").style.display = "block";
    const config = {
      containerId: Config.textDataScannerContainerId(),
      onTextDetected: onTextDataDetected,
      onError: onScannerError,
      ocrResolutionLimit: 400,
      supportedLanguages: ['eng', 'deu'],
      preferredCamera: 'camera2 0, facing back'
    };

    textDataScanner = await scanbotSDK.createTextDataScanner(config);
  };

  Utils.getElementByClassName("scanner-results-button").onclick = async (e) => {
    Utils.getElementByClassName("detection-results-controller").style.display =
      "block";
    await reloadDetectionResults();
  };

  Utils.getElementById("pick-document-button").onclick = (e) => {
    const picker = Utils.getElementByClassName("file-picker");
    picker.click();

    picker.onchange = (e) => {
      console.log("change");
      e.preventDefault();
      let reader = new FileReader();
      let file = e.target.files[0];
      reader.readAsArrayBuffer(file);

      reader.onload = async (e) => {
        const result = await scanbotSDK.detectDocument(reader.result);
        if (result.success === true) {
          const cropped = await scanbotSDK.cropAndRotateImageCcw(reader.result, result.polygon, 0);
          result.original = reader.result;
          result.cropped = cropped;

          const blurDetector = await scanbotSDK.createBlurDetector();
          console.log('estimateBlurrinessOnBuffer', await blurDetector.estimateBlurrinessOnBuffer(result.original));
          await blurDetector.release();

          results.push(result);
          Utils.getElementByClassName(
            "detection-results-controller"
          ).style.display = "block";
          await reloadDetectionResults();

        } else {
          alert("Detection failed");
        }
      };

      e.target.value = null;
    };
  };

  Utils.getElementById("pick-barcode-button").onclick = (e) => {
    const picker = Utils.getElementByClassName("file-picker");
    picker.click();

    picker.onchange = (e) => {
      e.preventDefault();
      let reader = new FileReader();
      let file = e.target.files[0];
      reader.readAsDataURL(file);

      reader.onload = async (e) => {
        const result = await scanbotSDK.detectBarcodes(reader.result);
        if (result.barcodes && result.barcodes.length > 0) {
          onBarcodesDetected(result);
        } else {
          alert("Detection failed");
        }

        console.log("barcode detection result", result);
      };
    };
  };

  Utils.getElementByClassName("license-info-button").onclick = async (e) => {
    const info = await scanbotSDK.getLicenseInfo();
    alert(JSON.stringify(info));
  };

  Utils.getElementByClassName("detect-button").onclick = async (e) => {
    await croppingView.detect();
  };

  Utils.getElementByClassName("rotate-button").onclick = async (e) => {
    await croppingView.rotate(1);
  };

  Utils.getElementByClassName("apply-button").onclick = async (e) => {
    ViewUtils.showLoading();
    const result = await croppingView.apply();
    croppingView.dispose();
    const index = Utils.getElementByClassName(
      "detection-result-image"
    ).getAttribute("index");
    results[index].filtered = undefined;
    results[index].cropped = result.image;
    results[index].polygon = result.polygon;
    results[index].rotations = result.rotations;

    if (results[index].filter) {
      results[index].filtered = await scanbotSDK.applyFilter(
        results[index].cropped,
        results[index].filter
      );
    }

    Utils.getElementByClassName("cropping-controller").style.display = "none";
    Utils.getElementByClassName("detection-result-controller").style.display =
      "block";

    await updateResultImage(index);
    ViewUtils.hideLoading();
  };

  Utils.getElementByClassName("pdf-button").onclick = async (e) => {
    if (results.length === 0) {
      console.log("No image results to save");
      return;
    }
    ViewUtils.showLoading();
    const generator = await scanbotSDK.beginPdf({
      standardPaperSize: "A4",
      landscape: true,
      dpi: 100,
    });
    await addAllPagesTo(generator);
    const bytes = await generator.complete();
    Utils.saveBytes(bytes, Utils.generateName() + ".pdf");
    ViewUtils.hideLoading();
  };

  Utils.getElementByClassName("tiff-button").onclick = async (e) => {
    if (results.length === 0) {
      console.log("No image results to save");
      return;
    }
    ViewUtils.showLoading();
    const generator = await scanbotSDK.beginTiff({
      binarizationFilter: "deepBinarization",
      dpi: 123,
    });
    await addAllPagesTo(generator);
    const bytes = await generator.complete();
    Utils.saveBytes(bytes, Utils.generateName() + ".tiff");
    ViewUtils.hideLoading();
  };

  Utils.getElementByClassName("action-bar-filter-select").onchange = async (
    e
  ) => {
    const index = Utils.getElementByClassName(
      "detection-result-image"
    ).getAttribute("index");
    const filter = e.target.value;

    ViewUtils.showLoading();
    if (filter === "none") {
      results[index].filtered = undefined;
    } else {
      let toFilter = results[index].cropped;
      if (!toFilter) {
        toFilter = results[index].original;
      }

      results[index].filter = filter;
      results[index].filtered = await scanbotSDK.applyFilter(toFilter, filter);
    }

    await updateResultImage(index);
    ViewUtils.hideLoading();
  };

  const backButtons = document.getElementsByClassName("back-button");

  for (let i = 0; i < backButtons.length; i++) {
    const button = backButtons[i];
    button.onclick = async (e) => {
      const controller =
        e.target.parentElement.parentElement.parentElement.className;
      Utils.getElementByClassName(controller).style.display = "none";

      if (controller.includes("scanbot-camera-controller")) {
        documentScanner.dispose();
        documentScanner = undefined;
      } else if (controller.includes("barcode-scanner-controller") || controller.includes("barcodecode-scanner-overlay-controller")) {
        barcodeScanner.dispose();
        barcodeScanner = undefined;
      } else if (controller.includes("mrz-scanner-controller")) {
        mrzScanner.dispose();
        mrzScanner = undefined;
      } else if (controller.includes("text-data-scanner-controller")) {
        textDataScanner.dispose();
        textDataScanner = undefined;
      } else if (controller.includes("detection-results-controller")) {
      } else if (controller.includes("detection-result-controller")) {
        Utils.getElementByClassName(
          "detection-results-controller"
        ).style.display = "block";
        await reloadDetectionResults();
      } else if (controller.includes("cropping-controller")) {
        Utils.getElementByClassName(
          "detection-result-controller"
        ).style.display = "block";
        croppingView.dispose();
        croppingView = undefined;
      }
    };
  }

  const cameraSwapButtons = document.getElementsByClassName("camera-swap-button");

  for (let i = 0; i < cameraSwapButtons.length; i++) {
    const button = cameraSwapButtons[i];
    button.onclick = async (e) => {

      if (documentScanner) {
        documentScanner.swapCameraFacing(true);
      } else if (barcodeScanner) {
        barcodeScanner.swapCameraFacing(true);
      } else if (mrzScanner) {
        mrzScanner.swapCameraFacing(true);
      } else if (textDataScanner) {
        textDataScanner.swapCameraFacing(true);
      }
    };
  }

  const cameraSwitchButtons = document.getElementsByClassName("camera-switch-button");

  for (let i = 0; i < cameraSwitchButtons.length; i++) {
    const button = cameraSwitchButtons[i];
    button.onclick = async (e) => {
      if (documentScanner) {
        onCameraSwitch(documentScanner);
      } else if (barcodeScanner) {
        onCameraSwitch(barcodeScanner);
      } else if (mrzScanner) {
        onCameraSwitch(mrzScanner);
      } else if (textDataScanner) {
        onCameraSwitch(textDataScanner);
      }
    };
  }

  scanbotSDK = await ScanbotSDK.initialize({ licenseKey: Config.license(), engine: '/wasm/' });
  ViewUtils.hideLoading();
};

async function onCameraSwitch(scanner) {
  const cameras = await scanner?.fetchAvailableCameras()
  if (cameras) {
    const currentCameraInfo = scanner?.getActiveCameraInfo();
    if (currentCameraInfo) {
      const cameraIndex = cameras.findIndex((cameraInfo) => { return cameraInfo.deviceId == currentCameraInfo.deviceId });
      const newCameraIndex = (cameraIndex + 1) % (cameras.length);
      alert(`Current camera: ${currentCameraInfo.label}.\nSwitching to: ${cameras[newCameraIndex].label}`)
      scanner?.switchCamera(cameras[newCameraIndex].deviceId);
    }
  }
}

async function onBarcodesDetected(e) {
  let text = "";
  e.barcodes.forEach((barcode) => {
    if (barcode.parsedText) {
      text += JSON.stringify(barcode.parsedText);
    } else {
      text += " " + barcode.text + " (" + barcode.format + "),";
    }
  });

  let result;
  if (e.barcodes[0].barcodeImage) {
    result = await scanbotSDK.toDataUrl(e.barcodes[0].barcodeImage);
  }

  Toastify({ text: text.slice(0, -1), duration: 3000, avatar: result }).showToast();
}

async function onMrzDetected(mrz) {
  mrzScanner.pauseDetection();

  let text = "";
  if (mrz) {
    text = text + 'Document Type: ' + (mrz.documentType ? (mrz.documentType.value + ` (${Number(mrz.documentType.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'First Name: ' + (mrz.givenNames ? (mrz.givenNames.value + ` (${Number(mrz.givenNames.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Last Name: ' + (mrz.surname ? (mrz.surname.value + ` (${Number(mrz.surname.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Issuing Authority: ' + (mrz.issuingAuthority ? (mrz.issuingAuthority.value + ` (${Number(mrz.issuingAuthority.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Nationality: ' + (mrz.nationality ? (mrz.nationality.value + ` (${Number(mrz.nationality.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Birth Date: ' + (mrz.birthDate ? (mrz.birthDate.value + ` (${Number(mrz.birthDate.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Gender: ' + (mrz.gender ? (mrz.gender.value + ` (${Number(mrz.gender.confidence).toFixed(3)})`) : '') + '\n';
    text = text + 'Date of Expiry: ' + (mrz.expiryDate ? (mrz.expiryDate.value + ` (${Number(mrz.expiryDate.confidence).toFixed(3)})`) : '') + '\n';
  }

  alert(text);

  setTimeout(() => {
    mrzScanner.resumeDetection();
  }, 1000);
}

async function onTextDataDetected(textData) {
  if (!textData) return;

  if (textData.validated) {
    if (typeof textDataScanner !== 'undefined') {
      textDataScanner.pauseDetection();
    }

    alert(textData.text);

    if (typeof textDataScanner !== 'undefined') {
      setTimeout(() => { textDataScanner.resumeDetection() }, 500);
    }
  }

}

async function onDocumentDetected(e) {
  results.push(e);
  ViewUtils.flash();
  Utils.getElementByClassName("page-count-indicator").innerHTML =
    results.length + " PAGES";
}

async function onScannerError(e) {
  console.log("Error:", e);
  alert(e.name + ': ' + e.message);
}

async function reloadDetectionResults() {
  const container = Utils.getElementByClassName("detection-results-container");
  container.innerHTML = await Utils.renderDetectionResults();
  const size = container.offsetWidth / 3;

  const items = document.getElementsByClassName("detection-result-list-image");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.style.width = size;
    item.style.height = size;
    item.onclick = onDetectionResultClick;
  }
}

async function onDetectionResultClick(e) {
  Utils.getElementByClassName("detection-results-controller").style.display =
    "none";
  Utils.getElementByClassName("detection-result-controller").style.display =
    "block";

  const index = e.target.getAttribute("index");
  Utils.getElementByClassName("action-bar-filter-select").selectedIndex =
    findFilterIndex(results[index].filter);
  await updateResultImage(index);
}

function findFilterIndex(filter) {
  const options = Utils.getElementByClassName(
    "action-bar-filter-select"
  ).options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === filter) {
      return i;
    }
  }

  return 0;
}

async function updateResultImage(index) {
  const image = await Utils.renderDetectionResult(index);
  Utils.getElementByClassName("detection-result-container").innerHTML = image;
}

async function addAllPagesTo(generator) {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    await generator.addPage(Utils.imageToDisplay(result));
  }
}

function resizeContent() {
  const height = document.body.offsetHeight - (50 + 59);
  const controllers = document.getElementsByClassName("controller");

  for (let i = 0; i < controllers.length; i++) {
    const controller = controllers[i];
    controller.style.height = height;
  }
}
