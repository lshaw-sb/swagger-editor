export function performanceLoggerStart(str){

  // if (process.env.NODE_ENV !== "production") {
      console.log(str + " Performance log START")
      console.timeStamp(str + " Performance log START")
  // }
}

export function performanceLoggerStop(str){

//  if (process.env.NODE_ENV !== "production") {
    console.log(str + " Performance log END")
    console.timeStamp(str + " Performance log END")
  }
//}

export function performanceLogger(str){

  //  if (process.env.NODE_ENV !== "production") {
      console.log(str)
      console.timeStamp(str)
    }
  //}

export function addBreakToPipelineBefore(func,log){

  function afterTimeout() {
    performanceLogger(" PIPELINE BREAK for 20MS for: "+log)
    if(window.globalStopPipeLine) {
      performanceLogger("PIPELINE INTERRUPTED!")
      return
    }
    func()
  }

  setTimeout(afterTimeout, 20)
}
