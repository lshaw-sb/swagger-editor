// eslint-disable-next-line no-undef, camelcase
__webpack_public_path__ = "/dist/"

import PromiseWorker from "promise-worker"
import debounce from "lodash/debounce"
import BareValidationWorker from "./validation.worker.js"

import { performanceLoggerStart,performanceLoggerStop,addBreakToPipelineBefore } from "plugins/utils"

export function makeValidationWorker() {
  var worker = new BareValidationWorker()
  var validationWorker = new PromiseWorker(worker)

  function runValidation({ specSelectors, errActions, resolvedSpec, mode }) {
    performanceLoggerStart("Editor:helper:runValidation")
    let specStr = specSelectors.specStr()

    if(specStr.trim().length === 0) {
      // don't run validation if spec is empty
      return
    }
    // This is where we pass JTD to the webworker
    const returnVal = validationWorker.postMessage({
      mode,
      jsSpec: specSelectors.specJson().toJS(),
      resolvedSpec,
      specStr
    }).then(

      function (validationErrors) {

        function processErrorsTimeout() {

          performanceLoggerStart("Editor:helper:validationWorker ASYNC")
          window.disableReduxRender = false
          // This is where we webworker passes back errors for us to apply
          errActions.clear({
            source: "schema"
          })

          // Filter out anything funky
          validationErrors = validationErrors
            .filter(val => typeof val === "object" && val !== null)

          if(validationErrors.length) {
            errActions.newSpecErrBatch(validationErrors)
          }
          performanceLoggerStop("Editor:helper:validationWorker ASYNC")

        }

        addBreakToPipelineBefore(() => processErrorsTimeout(),"validationWorker ASYNC")

    }).catch(function (e) {
      console.error(e)
    })
    performanceLoggerStop("Editor:helper:runValidation:")
    return returnVal
  }
  return debounce(runValidation, 300)
}
