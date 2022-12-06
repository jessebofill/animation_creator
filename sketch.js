

let canvas = {
    width: 400,
    height: 400
}

let animatedProperties = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 150,
    g: 150,
    b: 150
}
let propsOrder = ['x', 'y', 'r', 'g', 'b']

let boundingBox = {
    w: 100,
    h: 100,
    show: true,
    centerMode: true
}

let keyframes = {
    x: [[100, 10], [300, 50], [0, 129]],
    y: [],
    r: [],
    g: [],
    b: []
}

let keyframeHandlesAtFrame = {
    //frameNumber: [KeyframeHandle, KeyframeHandle]

}

let textBoxes = {
    frameNumber: {}
}

let frameNumber = 0

let clickInitiatedInMainCanvas = false
let clickXOffset, clickYOffset, mouseWasDragged

let mainCanvas
let tCanvas

function createFrameNumberInput() {
    let row = createDiv()
    textBoxes.frameNumber = createInput().size(50)
    let button = createButton('Set frame')
    parentElements(row, textBoxes.frameNumber, button)

    textBoxes.frameNumber.attribute('placeholder', 'frame')

    const setFrame = () => { setFrameNumber(textBoxes.frameNumber.value()) }
    button.mousePressed(setFrame);
    textBoxes.frameNumber.changed(setFrame)
    return row
}

function createResizeCanvasLine() {
    let row = createDiv()

    let wBox = createInput().size(50)
    let hBox = createInput().size(50)
    let button = createButton('Resize Canvas')

    parentElements(row, wBox, hBox, button)

    wBox.position(0, 0, 'relative')
    hBox.position(25, 0, 'relative')
    wBox.attribute('placeholder', 'width')
    hBox.attribute('placeholder', 'height')

    button.position(75, 0, 'relative')

    button.mousePressed(onClickResize);

    function onClickResize() {
        let w = wBox.value()
        let h = hBox.value()

        w = !isNaN(parseInt(w)) ? parseInt(w) : width
        h = !isNaN(parseInt(h)) ? parseInt(h) : height

        resizeCanvas(w, h)
    }

    return row
}


function parentElements(div, ...elements) {
    for (let element of elements) {
        element.parent(div)
    }
}

function setup() {
    mainCanvas = createCanvas(canvas.width, canvas.height);

    let frameRow = createFrameNumberInput()
    let row_1 = createTCanvas()
    let row_2 = createResizeCanvasLine()



    frameRow.position(20, -100, 'relative')
    row_1.position(10, 20, 'relative')
    row_2.position(120, 40, 'relative')

    // row_3.position(0, 20, 'relative')
    // row_4.position(0, 20, 'relative')
    // row_5.position(0, 20, 'relative')
}

function draw() {
    background(animatedProperties.r, animatedProperties.g, animatedProperties.b);

    noStroke()
    fill(255, 70)
    if (boundingBox.show) {
        let centerModeXOffset = centerModeYOffset = 0
        if (boundingBox.centerMode) {
            centerModeXOffset = boundingBox.w / 2
            centerModeYOffset = boundingBox.h / 2
        }
        rect(animatedProperties.x - centerModeXOffset, animatedProperties.y - centerModeYOffset, boundingBox.w, boundingBox.h)
    }
    stroke(40, 200)
    line(animatedProperties.x - 5, animatedProperties.y, animatedProperties.x + 5, animatedProperties.y)
    line(animatedProperties.x, animatedProperties.y - 5, animatedProperties.x, animatedProperties.y + 5)

}



function mousePressed() {
    clickInitiatedInMainCanvas = isInCanvas(mouseX, mouseY, mainCanvas) ? true : false

    clickXOffset = mouseX - animatedProperties.x
    clickYOffset = mouseY - animatedProperties.y
}

function mouseReleased() {
    if (!mouseWasDragged) {
        setCrosshairToMouse()
    }
    mouseWasDragged = false
}


function setCrosshairToMouse() {
    if (clickInitiatedInMainCanvas) {
        animatedProperties.x = mouseX
        animatedProperties.y = mouseY
    }
}

function mouseDragged() {
    if (clickInitiatedInMainCanvas) {
        mouseWasDragged = true
        animatedProperties.x = mouseX - clickXOffset
        animatedProperties.y = mouseY - clickYOffset
    }
}

class Timeline {
    constructor(w, h) {
        this.timelineCanvas = createGraphics(w, h)
        this.timelineCanvas.background(100)
    }

    position(x, y, type) {
        this.timelineCanvas.position(x, y, type)
    }
}
/**
 * NOTES
 * 
 * how can i add hook to keyframe handles
 */

const timelineInstance = (timeline) => {
    let page = 1
    let props = 5
    let framesPerPage = 120
    let labelSectionWidth = 80
    let timelineXOffset = labelSectionWidth
    let clickInitiatedInTimeline = false
    let dragLeftTimeline = false

    let clickedKeyframeHandle

    let keyframeHandles = []


    timeline.findHandlesAtFrame = (frame) => {
        let handlesAtFrame = []
        for (let handle of keyframeHandles) {
            if (handle.frameNum === frame) handlesAtFrame.push(handle)
        }
        return handlesAtFrame
    }

    timeline.findKeyIndexAtFrame = (frame, index, array) => {
        return frame === array[index][1]
    }

    timeline.updateKeyframeHandle = (keyframeIndex, prop, value, frame, interp) => {
        //if (frame != undefined) 
    }

    // timeline.addKeyframeHandle = (prop, value, frame, interp) => {
    //     let rowHeight = timeline.height / propsOrder.length
    //     let y = rowHeight * propsOrder.indexOf(prop) + rowHeight / 2

    //         let x = timeline.frameNumToXCoord(frame)
    //         if (keyframeHandlesAtFrame[frame] === undefined) keyframeHandlesAtFrame[frame] = []
    //         let h = new KeyframeHandle(x, y, prop, frame, value, interp)
    //         keyframeHandlesAtFrame[frame].push(h)
    //         keyframeHandles.push(h)

    // }

    timeline.addKeyframeHandle = (prop, index, value, frame, interp) => {
        let rowHeight = timeline.height / propsOrder.length
        let y = rowHeight * propsOrder.indexOf(prop) + rowHeight / 2

        let x = timeline.frameNumToXCoord(frame)
        keyframeHandles.push(new KeyframeHandle(x, y, prop, index, value, frame, interp))
    }

    timeline.changePage = (a) => {
        page = a
    }

    class KeyframeHandle {
        constructor(x, y, prop, index, value, frame, interp) {
            this.x = x
            this.y = y
            this.d = 9
            this.frameNum = frame
            this.prop = prop
            this.keyframeIndex = index
            this.value = value
            
            this.page = this.getPageFromFrame(frame)
        }

        containsCoords(x, y) {
            let dx = x - this.x
            let dy = y - this.y
            let r = this.d / 2
            return (dx * dx) + (dy * dy) < (r * r)
        }

        updateFrameNumAfterDrag() {
            this.frameNum = timeline.xCoordToClosestFrameNum(this.x)
            updateKeyframe(this.keyframeIndex, this.prop, undefined, this.frameNum)
        }
        move(x) {
            let frame = timeline.xCoordToClosestFrameNum(x)
            this.x = timeline.frameNumToXCoord(frame)

            // if(frame > page * framesPerPage) {
            //     page = this.getPageFromFrame(frame)
            //     console.log('-- > KeyframeHandle > page', page)

                
            // }
        }
        getPageFromFrame(frame) {
            return Math.floor(frame / framesPerPage) + 1
        }

        delete() {

        }
    }


    timeline.isInsideHandle = (x, y) => {
        let possibleHandles = timeline.findHandlesAtFrame(timeline.xCoordToClosestFrameNum(x))
        for (let handle of possibleHandles) {
            if (handle.containsCoords(x, y)) {
                console.log(handle)
                return handle
            }
        }
        return false
    }

    timeline.mousePressed = () => {
        clickedKeyframeHandle = timeline.isInsideHandle(timeline.mouseX, timeline.mouseY)

        clickInitiatedInTimeline = timeline.isInTimeline(timeline.mouseX, timeline.mouseY) ? true : false
        if (clickInitiatedInTimeline) timeline.setFrameFromMouse()

    }

    timeline.mouseReleased = () => {
        if (clickedKeyframeHandle) clickedKeyframeHandle.updateFrameNumAfterDrag()
        console.log('-- > clickedKeyframeHandle', clickedKeyframeHandle)
        clickedKeyframeHandle = undefined

        dragLeftTimeline = false
    }

    timeline.mouseDragged = () => {
        if (clickInitiatedInTimeline) {
            timeline.setFrameFromMouse()
            if(!dragLeftTimeline && timeline.mouseX > timeline.width) {
                page++
                dragLeftTimeline = true
                if (dragLeftTimeline) clickedKeyframeHandle.page++
            }
        }
        if (clickedKeyframeHandle) {
            clickedKeyframeHandle.move(timeline.mouseX)
            animatedProperties[clickedKeyframeHandle.prop] = clickedKeyframeHandle.value
        }
    }

    timeline.wasMouseDraggedOut = () => {
        
    }


    timeline.isInTimeline = (x, y) => {
        return isInCanvas(x, y, tCanvas) && (x >= labelSectionWidth)
    }

    timeline.rescale = (newSize) => {
        timeline.resizeCanvas(newSize, 100)
        for (let handle of keyframeHandles) {
            handle.x = timeline.frameNumToXCoord(handle.frameNum)
        }
    }

    timeline.setup = () => {
        tCanvas = timeline.createCanvas(1880, 100)
        let rescaleTimelineSlider = timeline.createSlider(980, 1880, 1880, 60)
        rescaleTimelineSlider.changed(() => timeline.rescale(rescaleTimelineSlider.value()))

        /**
         * temporarily add keyframe handles using predefined keyframes
         * 
         */

        //updateKeyframeTHook = timeline.updateKeyframeHandle
        setKeyframeTHook = timeline.addKeyframeHandle
        for (let prop in keyframes) {
            for (let i = 0; i < keyframes[prop].length; i++) {
                let keyframe = keyframes[prop][i]
                timeline.addKeyframeHandle(prop, i, keyframe[0], keyframe[1], keyframe[2])
            }
        }
    }




    timeline.draw = () => {
        timeline.background(110, 120, 135)
        timeline.drawRows()
        timeline.drawLineSegments()
        timeline.drawFrameNums()
        timeline.drawCursor()
        timeline.drawKeyframeHandles()
    }

    timeline.frameNumToXCoord = (frame) => {
        let frameOnPage = frame % framesPerPage
        return ((timeline.width - labelSectionWidth) / framesPerPage) * frameOnPage + timelineXOffset
    }

    timeline.xCoordToClosestFrameNum = (x) => {
        let pixelsPerDivision = (timeline.width - labelSectionWidth) / framesPerPage
        let f = (x - timelineXOffset) / pixelsPerDivision
        let framesTimesPages = (page - 1) * framesPerPage
        return x > (timeline.width - pixelsPerDivision) ? framesTimesPages + Math.floor(f) : framesTimesPages + Math.round(f)
    }

    timeline.setFrameFromMouse = () => {

        /**
         * add if cursor release on new keyframe only then update
         */

        if (timeline.isInTimeline(timeline.mouseX, timeline.mouseY)) {
            setFrameNumber(timeline.xCoordToClosestFrameNum(timeline.mouseX))
        }
    }

    timeline.drawRows = () => {
        timeline.push()
        timeline.noStroke()
        timeline.fill(200, 80)
        for (let i = 0; i < propsOrder.length; i++) {
            let rowH = timeline.height / propsOrder.length
            if (i % 2 == 1) timeline.rect(0, i * rowH, timeline.width, rowH)
        }

        timeline.fill(60, 70, 85, 170)
        timeline.rect(0, 0, labelSectionWidth - 0, timeline.height)

        timeline.fill(250, 200)
        timeline.textAlign(LEFT, TOP)
        for (let i = 0; i < propsOrder.length; i++) {
            let y = (timeline.height / propsOrder.length) * i
            timeline.text(propsOrder[i], 10, y + 5)
        }
        timeline.pop()
    }

    timeline.drawLineSegments = () => {
        timeline.push()
        for (let i = 0; i <= framesPerPage; i++) {
            let x = timeline.frameNumToXCoord(i)
            timeline.stroke(160, 100)
            if (i % 5 === 0) {
                timeline.stroke(40, 100)
            }
            if (i % 10 === 0) timeline.stroke(20, 180)
            timeline.line(x, 0, x, timeline.height)
        }
        timeline.pop()
    }

    timeline.drawFrameNums = () => {
        timeline.push()
        timeline.fill(10, 150)
        timeline.textAlign(LEFT)
        timeline.textSize(9)
        for (let i = 0; i < framesPerPage; i += 5) {
            let x = timeline.frameNumToXCoord(i)
            timeline.text(i + ((page - 1) * framesPerPage) + '', x + 1, 9)
        }
        timeline.pop()
    }

    timeline.drawCursor = () => {
        timeline.push()
        if (frameNumber < (page * framesPerPage) && frameNumber >= (page * framesPerPage) - framesPerPage) {
            let x = timeline.frameNumToXCoord(frameNumber)
            timeline.strokeWeight(5)
            timeline.stroke(75, 150, 240, 180)
            timeline.line(x, 0, x, timeline.height)
        }
        timeline.pop()
    }

    timeline.drawKeyframeHandles = () => {
        timeline.push()

        timeline.fill(165, 235, 225)
        for (let handle of keyframeHandles) {
            // console.log(handle.x)
            if (handle.page === page) {
                timeline.circle(handle.x, handle.y + 1, handle.d)
            }
        }

        timeline.pop()
    }
}
function createTCanvas() {
    new p5(timelineInstance)
    return tCanvas
}

function isInCanvas(x, y, elt) {
    let size = elt.size()
    let w = size.width
    let h = size.height
    return (x >= 0 && x < w && y >= 0 && y < h)
}

function setFrameNumber(f) {

    frameNumber = f

    textBoxes.frameNumber.value(f)

    for (let prop in keyframes) {
        if (keyframes[prop].length) {
            for (let i = keyframes[prop].length - 1; i >= 0; i--) {
                //set value to last keyframe
                if (f >= keyframes[prop][i][1]) {
                    animatedProperties[prop] = keyframes[prop][i][0]
                    break
                }
            }
        }
    }
}

function setKeyframeTHook() {
}

function updateKeyframeTHook() {
}

function setKeyframe(prop, value, frame, interp) {
    setKeyframeTHook(prop, value, frame, interp)
}

function updateKeyframe(keyframeIndex, prop, value, frame, interp) {
    //updateKeyframeTHook(keyframeIndex, prop, value, frame, interp)
    if (value !== undefined) keyframes[prop][keyframeIndex][0] = value
    if (frame !== undefined) keyframes[prop][keyframeIndex][1] = frame
    if (interp !== undefined) keyframes[prop][keyframeIndex][2] = interp
}


