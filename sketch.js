

const canvas = {
    width: 400,
    height: 400
}

const animatedProperties = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 150,
    g: 150,
    b: 150,
    a: 255,
    t: 0,
    u: 0
}

const origins = structuredClone(animatedProperties)

const propsOrder = ['x', 'y', 'r', 'g', 'b', 'a', 't', 'u']

const boundingBox = {
    w: 100,
    h: 100,
    show: true,
    rectMode: 'corner'
}

const alphaBackground = {
    r: 250,
    g: 150,
    b: 150,
}

let visualizeColorOnBackground = true

const keyframes = {
    x: [[100, 10, 'exp'], [300, 50, 'expo1'], [0, 80, 'expo2']],
    y: [],
    r: [],
    g: [],
    b: [],
    a: [],
    t: [],
    u: [],

}

const interpTypes = ['linear', 'expo1', 'expo2', 'expo3']

let animationMode = 'relative'

let keyframeHandlesAtFrame = {
    //frameNumber: [KeyframeHandle, KeyframeHandle]

}

const textBoxes = {
    frameNumber: {}
}

const radios = {}

let frameNumber = 0

let clickInitiatedInMainCanvas = false
let clickXOffset, clickYOffset, mouseWasDragged

let mainCanvas
let tCanvas

function isParsedNum(string, mode) {
    let parse
    if (mode === 0) parse = parseInt
    else parse = parseFloat

    for (let i = 0; i < string.length; i++) {
        if (string.charCodeAt(i) === 46 && mode === 1) continue
        if (isNaN(parse(string.charAt(i)))) return false
    }
    return true
}

function updateTextBoxes(...props) {
    if (props[0] === 'allProps') {
        for (let prop in animatedProperties) {
            textBoxes[prop]
            setTextBoxValue(textBoxes[prop], animatedProperties[prop])
        }
        props.splice(0, 1)
    }
    for (let prop of props) {
        const value = prop === 'frameNumber' ? frameNumber : animatedProperties[prop]
        setTextBoxValue(textBoxes[prop], value)
    }
}

function setTextBoxValue(box, value) {
    box.default = value
    box.value(value)
}

function changeTextBoxColor(box, color) {
    box.style('color', color)
}

const textBoxSetup = (box, validateValue, hanldeValidValue, submitButton) => {
    //make sure to set id before calling this

    box.default = box.value()

    const htmlBox = document.getElementById(box.id())
    htmlBox.oninput = () => changeTextBoxColor(box, 'red')
    htmlBox.onblur = () => { setTextBoxValue(box, box.default); changeTextBoxColor(box, 'black') }
    htmlBox.onfocus = () => box.value('')

    const submitInput = () => {
        let value = box.value()
        console.log('subumitted: ' + value)
        if (validateValue(value)) {
            value = parseFloat(value)
            hanldeValidValue(value)
            setTextBoxValue(box, value)
        } else {
            setTextBoxValue(box, box.default)
        }
        changeTextBoxColor(box, 'black')
    }

    htmlBox.addEventListener('keydown', (event) => { if (event.key === "Enter") submitInput() })
    submitButton?.mousePressed(submitInput);
}

function createVizualizeColorSpan() {
    const span = createSpan()


    const radioSpan = createSpan('Visualize Color on:')
    radioSpan.id('colorMode_radio')

    const colorVMode = createRadio('colorMode')
    colorVMode.hide()
    colorVMode.option('canvas', 'canvas (no alpha)')
    colorVMode.option('box', 'bounding box')
    colorVMode.selected('canvas')
    radioSpan.html(colorVMode.html(), true)

    const element = document.getElementById('colorMode_radio')

    const alphaBox = document.getElementById('abox')
    alphaBox.disabled = true
    const toggleColorMode = () => {
        // boundingBox.rectMode = boundingBox.rectMode === 'corner' ? 'center' : 'corner'
        visualizeColorOnBackground = document.querySelector('input[name="colorMode"]:checked').value === 'canvas'
        alphaBox.disabled = visualizeColorOnBackground
    }
    element.onchange = toggleColorMode

    parentElements(span, radioSpan)
    return span
}


function createFrameNumberInput() {
    const span = createSpan()
    span.style('flex', '1')
    span.style('text-align', 'right')
    span.style('white-space', 'nowrap')

    const box = createInput()
    textBoxes.frameNumber = box
    box.id('frameInput')
    box.value(frameNumber)
    box.size(50)
    box.attribute('placeholder', 'frame')
    box.style('margin-right', '15px')

    const button = createButton('Go to frame')
    button.style('margin-right', '20px')

    const hanldeValidValue = (value) => {
        const frame = value
        setFrameNumber(frame);
        pageChangeListenerTHook()
    }

    textBoxSetup(box, value => value >= 0 && isParsedNum(value, 0), hanldeValidValue, button)
    parentElements(span, box, button)

    return span
}

function createExportButton() {
    const span = createSpan()
    span.style('text-align', 'right')
    span.style('flex', '1')
    span.style('white-space', 'nowrap')

    const button = createButton('Export Keyframes')
    button.style('margin-right', '20px')
    button.mousePressed(exportKeyframes)

    parentElements(span, button)
    return span
}

function createBoundingBoxSettings() {
    const span = createSpan()
    span.style('text-align', 'center')
    span.style('flex', '6')
    span.style('white-space', 'nowrap')



    const visualizeCheck = createCheckbox('Visualize Box', true)
    visualizeCheck.hide()
    const checkSpan = createSpan()
    checkSpan.id('showHitBox_check')
    checkSpan.html(visualizeCheck.html(), true)
    const element = document.getElementById('showHitBox_check').firstElementChild.firstElementChild
    element.checked = true
    element.onchange = () => console.log(boundingBox.show = element.checked)

    const rectModeSpan = createSpan('Rect Mode:')
    rectModeSpan.id('rectMode_radio')

    const rectModeToggle = createRadio('rectMode')
    rectModeToggle.hide()
    rectModeToggle.option('corner', 'corner')
    rectModeToggle.option('center', 'center')
    rectModeToggle.selected('corner')
    rectModeSpan.html(rectModeToggle.html(), true)

    const toggleRectMode = () => {
        boundingBox.rectMode = boundingBox.rectMode === 'corner' ? 'center' : 'corner'
        rectMode(boundingBox.rectMode)
    }
    document.getElementById('rectMode_radio').onchange = toggleRectMode

    const resizeBoundingBox = createResizeBoxSpan()

    resizeBoundingBox.style('margin-left', '20px')
    resizeBoundingBox.style('margin-right', '20px')
    parentElements(span, checkSpan, resizeBoundingBox, rectModeSpan)
    return span
}

function createResizeBoxSpan() {
    const span = createSpan()

    const resizeText = createSpan('Resize')
    resizeText.style('margin-right', '6px')

    const wBox = createInput()
    wBox.id('w_boundingBox')
    wBox.size(35)
    wBox.attribute('placeholder', 'width')
    wBox.style('margin-right', '6px')

    const hBox = createInput()
    hBox.id('h_boundingBox')
    hBox.size(37)
    hBox.attribute('placeholder', 'height')

    parentElements(span, resizeText, wBox, hBox)

    const resize = (val, d) => {
        if (!d) {
            boundingBox.w = val
            document.getElementById('h_boundingBox').focus()
        }
        else boundingBox.h = val

    }

    textBoxSetup(wBox, val => isParsedNum(val, 0), val => resize(val, 0))
    textBoxSetup(hBox, val => isParsedNum(val, 0), val => resize(val, 1))

    return span
}

function createResizeCanvasSpan() {
    const span = createSpan()
    span.style('flex', '2')
    span.style('text-align', 'left')
    span.style('white-space', 'nowrap')

    const resizeText = createSpan('Resize Canvas')
    resizeText.style('margin-right', '6px')

    const wBox = createInput()
    wBox.id('w_canvasBox')
    wBox.size(35)
    wBox.attribute('placeholder', 'width')
    wBox.style('margin-right', '6px')

    const hBox = createInput()
    hBox.id('h_canvasBox')
    hBox.size(37)
    hBox.attribute('placeholder', 'height')

    parentElements(span, resizeText, wBox, hBox)

    const resize = (val, d) => {
        if (!d) {
            resizeCanvasWrapper(val, height)
            document.getElementById('h_canvasBox').focus()
        }
        else resizeCanvasWrapper(width, val)

    }

    textBoxSetup(wBox, val => isParsedNum(val, 0), val => resize(val, 0))
    textBoxSetup(hBox, val => isParsedNum(val, 0), val => resize(val, 1))

    return span
}

function createUtilityRow() {
    const row = createDiv()
    row.style('display', 'flex')

    const resizeCanvasSpan = createResizeCanvasSpan()
    const rectModeSpan = createBoundingBoxSettings()
    const exportButton = createExportButton()

    resizeCanvasSpan.style('margin-left', '10px')
    exportButton.style('margin-right', '10px')

    parentElements(row, resizeCanvasSpan, rectModeSpan, exportButton)
    return row
}

function createAniModeSpan() {
    const span = createSpan()
    span.style('flex', '1')
    span.style('text-align', 'left')
    span.style('white-space', 'nowrap')

    const aniModeText1 = createSpan('Animation Mode:')
    aniModeText1.id('aniMode_span')

    const aniModeRadio = createRadio('aniModeRadio')
    aniModeRadio.hide()
    aniModeRadio.option('absolute', 'absolute')
    aniModeRadio.option('relative', 'relative')
    aniModeRadio.selected('absolute')
    aniModeText1.html(aniModeRadio.html(), true)

    const toggleAnimationMode = () => {
        animationMode = animationMode === 'relative' ? 'absolute' : 'relative'
        document.getElementById('valueLine1').innerHTML = animationMode === 'relative' ? 'Absolute' : 'Relative'
        document.getElementById('valueLine2').innerHTML = animationMode === 'relative' ? 'Value' : 'Origin'

        //clear keyframes
    }

    document.getElementById('aniMode_span').onchange = toggleAnimationMode

    parentElements(span, aniModeText1)
    return span
}

function createUtilityRow2() {
    const row = createDiv()
    row.style('display', 'flex')

    const aniModeSpan = createAniModeSpan()
    const frameSet = createFrameNumberInput()

    aniModeSpan.style('margin-left', '10px')
    frameSet.style('margin-right', '10px')

    parentElements(row, aniModeSpan, frameSet)
    return row
}

function resizeCanvasWrapper() {

}

function createInterpRadio(name) {
    const radio = createRadio(name)
    radio.option('linear', '')
    radio.option('expo1', '');
    radio.option('expo2', '');
    radio.option('expo3', '');
    radio.selected('linear');
    return radio
}

function setRadioSelection(group, type) {
    radios[group].selected(type)
}
function getRadioSelection(group) {
    return radios[group].selected().value
}

function createPropTextBox(prop, size, x1) {
    const box = createInput()
    textBoxes[prop] = box
    box.value(animatedProperties[prop])
    box.attribute('placeholder', prop)
    box.position(x1)
    box.size(...size)
    box.id(prop + 'box')


    const hanldeValidValue = (value) => {
        animatedProperties[prop] = value
    }

    const parseMode = prop === 't' || prop === 'u' ? 1 : 0
    let validation
    if (prop == 'r' || prop == 'g' || prop == 'b' || prop == 'a') {
        validation = (val) => {
            return isParsedNum(val, parseMode) && val >= 0 && val <= 255
        }
    } else {
        validation = (val) => {
            return isParsedNum(val, parseMode)
        }
    }

    textBoxSetup(box, validation, hanldeValidValue)

    return box
}

function createRenamePropOnExportTextBox(prop, x) {
    const box = createInput()
    textBoxes[prop + '_rename'] = box
    box.attribute('placeholder', 'New Name')
    box.size(65)
    box.position(x)
    return box
}



function createPropsSectionHeader(x1, x2, x3, x4, x5, x6, x7, radioMargin) {
    const row = createDiv()
    row.style('margin-bottom', '45px')
    const propName = createSpan('Prop')
    const value1 = createSpan('Absolute')
    const value2 = createSpan('Value')
    const originButton = createButton('Set Origins')
    const addKey1 = createSpan('Add/ Update')
    const addKey2 = createSpan('Keyframe')
    const interpType = createSpan('Interpolation Type')
    const linear = createSpan('linear')
    const expo1 = createSpan('expo1')
    const expo2 = createSpan('expo2')
    const expo3 = createSpan('expo3')
    const addAllButton = createButton('Key All')
    const rename = createSpan('Export Prop As')

    propName.position(x1)
    value1.position(x2)
    value2.position(x2, 20)
    originButton.position(x3)
    interpType.position(x4)
    linear.position(x4, 25)
    expo1.position(x4 + radioMargin, 25)
    expo2.position(x4 + radioMargin * 2, 25)
    expo3.position(x4 + radioMargin * 3, 25)
    addKey1.position(x5)
    addKey2.position(x5, 20)
    addAllButton.position(x6)
    rename.position(x7)

    value1.id('valueLine1')
    value2.id('valueLine2')

    addAllButton.size(60)
    originButton.style('white-space', 'normal')
    originButton.mousePressed(setOrigins)

    addAllButton.mousePressed(() => {
        const skipA = document.getElementById('abox').disabled

        for (let prop of propsOrder) {
            if (skipA && prop === 'a') continue
            captureKeyframe(prop)
        }
    })

    parentElements(row, propName, value1, value2, originButton, interpType, linear, addKey1, addKey2, expo1, expo2, expo3, addAllButton, rename)
    return row
}

function createKeyframeButtons(prop, x1, x2, row) {
    const button = createButton('Keyframe')
    button.position(x1)
    button.mousePressed(() => captureKeyframe(prop))
    if (prop === 'x') {
        const allCoords = createButton('Key All Coords')
        allCoords.position(x2)
        allCoords.size(60, 48)
        allCoords.style('white-space', 'normal')
        parentElements(row, allCoords)
        allCoords.mousePressed(() => {
            captureKeyframe('x')
            captureKeyframe('y')
        })
    }

    if (prop === 'r') {
        const allColors = createButton('Key All Colors')
        allColors.position(x2)
        allColors.size(60, 100)
        allColors.style('white-space', 'normal')
        parentElements(row, allColors)
        allColors.mousePressed(() => {
            captureKeyframe('r')
            captureKeyframe('g')
            captureKeyframe('b')
            if (!document.getElementById('abox').disabled) captureKeyframe('a')
        })
    }
    if (prop === 't') {
        const allOthers = createButton('Key All Others')
        allOthers.position(x2)
        allOthers.size(60, 48)
        allOthers.style('white-space', 'normal')
        parentElements(row, allOthers)
        allOthers.mousePressed(() => {
            captureKeyframe('t')
            captureKeyframe('u')
        })
    }

    return button
}

function setOrigins() {
    for (let prop of propsOrder) {
        const id = prop + '_originCheck'
        const element = document.getElementById(id)
        if (element.checked) origins[prop] = animatedProperties[prop]
    }
}

function createSetOrigins(prop, x) {
    const id = prop + '_originCheck'
    const checkHtml = '<label><input type="checkbox" id="' + id + '" style="position: absolute; left: ' + (x + 20) + 'px;"></label>'

    return checkHtml
}

function createPropEditorDiv() {
    const interpColors = [
        '165, 235, 225',
        '255, 255, 90',
        '255, 200, 120',
        '255, 165, 190'
    ]
    const x = [0, 46, 100, 125, 240, 340, 420, 685]
    const inputBoxSize = [30, 15]
    const radioMargin = 48
    const container = createDiv()
    for (let i = 0; i < 4; i++) {
        const rectangle = createDiv().style('background', 'rgb(' + interpColors[i] + ')')
        rectangle.size(48, 243)
        rectangle.position(x[6] + 48 * i - 5, 24)
        parentElements(container, rectangle)
    }

    const rows = [createPropsSectionHeader(x[0], x[1], x[3], x[6], x[4], x[5], x[7], radioMargin)]
    for (let prop of propsOrder) {
        const row = createInterpRadio(prop)
        row.style('margin-top', '8px')
        if (prop === 'r' || prop === 't') {
            row.style('margin-top', '16px')
        }

        radios[prop] = row
        //save html radio tags and remove
        const radioHTML = row.html()
        row.html('')

        const propName = createSpan(prop + ':')
        const inputField = createPropTextBox(prop, inputBoxSize, x[1], x[2])
        const originChecks = createSetOrigins(prop, x[3])
        const keyButtons = createKeyframeButtons(prop, x[4], x[5], row)
        const renamePropBox = createRenamePropOnExportTextBox(prop, x[7])


        parentElements(row, propName, inputField, keyButtons, renamePropBox)

        //add html radio tags back
        row.html(radioHTML, true)
        row.html(originChecks, true)

        rows.push(row)
    }

    document.querySelectorAll('input[type="radio"]').forEach((element) => {
        element.style.marginLeft = '0px';
        element.style.position = 'absolute';
        element.style.left = x[6] + radioMargin * interpTypes.indexOf(element.value) + 'px';
    })

    const colorVisualizer = createVizualizeColorSpan()
    parentElements(container, ...rows, colorVisualizer)
    container.style('white-space', 'nowrap')
    return container
}



function parentElements(div, ...elements) {
    for (let element of elements) {
        element.parent(div)
    }
}

function setup() {
    mainCanvas = createCanvas(canvas.width, canvas.height);
    rectMode(boundingBox.rectMode)

    const rightOfCanvas = createPropEditorDiv()
    const utilityRow = createUtilityRow()
    const utilityRow2 = createUtilityRow2()
    const timeline = createTCanvas()

    resizeCanvasWrapper = (w, h) => {
        console.log('resize')
        resizeCanvas(w, h)
        rightOfCanvas.position(w + 40, 20)
    }

    rightOfCanvas.position(canvas.width + 40, 20)
    utilityRow.position(0, -140, 'relative')
    utilityRow2.position(0, -130, 'relative')
    timeline.position(0, 70, 'relative')

    // row_3.position(0, 20, 'relative')
    // row_4.position(0, 20, 'relative')
    // row_5.position(0, 20, 'relative')
}

function draw() {
    if (visualizeColorOnBackground) background(animatedProperties.r, animatedProperties.g, animatedProperties.b);
    else background(alphaBackground.r, alphaBackground.g, alphaBackground.b);
    noStroke()
    if (boundingBox.show) {
        if (visualizeColorOnBackground) fill(255, 70)
        else fill(animatedProperties.r, animatedProperties.g, animatedProperties.b, animatedProperties.a)

        rect(animatedProperties.x, animatedProperties.y, boundingBox.w, boundingBox.h)
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
        animatedProperties.x = Math.round(mouseX)
        animatedProperties.y = Math.round(mouseY)
        console.log(mouseX)
        updateTextBoxes('x', 'y')
    }
}

function mouseDragged() {
    if (clickInitiatedInMainCanvas) {
        mouseWasDragged = true
        animatedProperties.x = mouseX - clickXOffset
        animatedProperties.y = mouseY - clickYOffset
        updateTextBoxes('x', 'y')
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
    const framesPerPage = 120
    const labelSectionWidth = 80
    const gridX0 = labelSectionWidth
    let clickInitiatedInTimeline = false
    let dragLeftTimeline = false
    let dragLeftOnce = false
    let mouseAboveUpper = false
    let mouseBelowLower = false

    const pageChangeAniFrameDur = 50

    let pageChangeAniRunning = false
    let pageChangeAniStartFrame

    let clickedKeyframeHandle

    let keyframeHandles = []


    timeline.findHandlesAtFrame = (frame) => {
        let handlesAtFrame = []
        for (let handle of keyframeHandles) {
            if (handle.frameNum === frame) handlesAtFrame.push(handle)
        }
        return handlesAtFrame
    }

    timeline.findKeyIndexAtFrame = (keyframe, prop) => {
        for (let i = 0; i < keyframes[prop].length; i++) {
            if (keyframe === keyframes[prop][i][1]) {
                console.log('I: ' + i)
                return i
            }
        }
        return -1
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

    timeline.pageChangeTextAnimation = () => {
        if (timeline.frameCount <= pageChangeAniStartFrame + pageChangeAniFrameDur) {
            let a = (1 - ((timeline.frameCount - pageChangeAniStartFrame) / pageChangeAniFrameDur)) * 255
            let lowerFrame = (page * framesPerPage) - framesPerPage
            let upperFrame = (page * framesPerPage) - 1
            timeline.push()
            timeline.fill(250, a)
            timeline.textSize(20)
            timeline.textAlign(timeline.RIGHT, timeline.CENTER)
            timeline.text(upperFrame, timeline.width - 10, timeline.height / 2 + 2)
            timeline.textAlign(timeline.LEFT, timeline.CENTER)
            timeline.text(lowerFrame, gridX0 + 10, timeline.height / 2 + 2)
            timeline.textSize(60)
            timeline.textAlign(timeline.CENTER, timeline.CENTER)
            timeline.text(page, (timeline.width + gridX0) / 2, timeline.height / 2)
            timeline.pop()
        } else pageChangeAniRunning = false
    }

    timeline.addKeyframeHandle = (prop, index, value, frame, interp) => {
        let rowHeight = timeline.height / propsOrder.length
        let y = rowHeight * propsOrder.indexOf(prop) + rowHeight / 2

        let x = timeline.frameNumToXCoord(frame)
        keyframeHandles.push(new KeyframeHandle(keyframes[prop][index], x, y, prop, index, value, frame, interp))
    }

    timeline.deleteKeyframeHandle = (keyframe, prop) => {
        //clickedKeyframeHandle = undefined
        let i = keyframeHandles.findIndex((handle) => handle.keyframe === keyframe && prop === handle.prop)
        console.log('handle: ' + i)
        keyframeHandles.splice(i, 1)
    }

    class KeyframeHandle {
        constructor(keyframe, x, y, prop, index, value, frame, interp) {
            this.keyframe = keyframe
            this.x = x
            this.y = y
            this.d = 9
            this.frameNum = frame
            this.prop = prop
            this.keyframeIndex = index
            this.value = value

            this.page = timeline.getPageFromFrame(frame)
            this.previousPage = this.page
            this.isHeld = false
            this.highlight = false
        }

        containsCoords(x, y) {
            let dx = x - this.x
            let dy = y - this.y
            let r = this.d / 2
            return (dx * dx) + (dy * dy) < (r * r)
        }

        updateAfterDrag() {
            let newFrame = timeline.xCoordToClosestFrameNum(this.x)
            let existingHandleIndex = timeline.findKeyIndexAtFrame(newFrame, this.prop)
            let thisHandleCurrentIndex = timeline.findKeyIndexAtFrame(this.frameNum, this.prop)
            if (existingHandleIndex !== -1 && existingHandleIndex !== thisHandleCurrentIndex) deleteKeyframe(keyframeHandles[existingHandleIndex].keyframe, this.prop)
            console.log('-- > KeyframeHandle > existingHandleIndex', existingHandleIndex)

            this.frameNum = newFrame
            this.keyframe[1] = this.frameNum
            let nearestID = findKeyIndexForFrame(this.frameNum, this.prop)
            reorderKeyframes(this.prop, thisHandleCurrentIndex, nearestID)
            // console.log('frame: ' + this.frameNum)
            // console.log('new: ' + nearestID)
            // updateKeyframe(this.keyframeIndex, this.prop, undefined, this.frameNum)
            console.log(keyframes[this.prop])
            this.previousPage = this.page
        }

        move(x) {
            this.page = page
            let xx = x > timeline.width ? gridX0 + (x - timeline.width) : x < gridX0 ? (this.previousPage == 1 ? gridX0 : timeline.width - (gridX0 - x)) : x
            let frame = timeline.xCoordToClosestFrameNum(xx)
            let newX = timeline.frameNumToXCoord(frame)
            if (this.x !== newX) {
                console.log('changed')
                this.highlight = true
                this.x = newX
            }
        }

        show() {
            if (this.page === page) {
                timeline.circle(this.x, this.y + 1, this.d)
            }
        }



        delete() {

        }
    }


    timeline.isInsideHandle = (x, y) => {
        let possibleHandles = timeline.findHandlesAtFrame(timeline.xCoordToClosestFrameNum(x))
        for (let handle of possibleHandles) {
            if (handle.containsCoords(x, y)) {
                // console.log(handle)
                return handle
            }
        }
        return false
    }

    timeline.mousePressed = () => {
        clickedKeyframeHandle = timeline.isInsideHandle(timeline.mouseX, timeline.mouseY)
        if (clickedKeyframeHandle) clickedKeyframeHandle.highlight = true
        clickInitiatedInTimeline = timeline.isInTimeline(timeline.mouseX, timeline.mouseY) || clickedKeyframeHandle ? true : false
        if (clickInitiatedInTimeline) timeline.setFrameFromMouse()

    }

    timeline.mouseReleased = () => {
        if (clickedKeyframeHandle) {
            clickedKeyframeHandle.updateAfterDrag()
            console.log('-- > clickedKeyframeHandle', clickedKeyframeHandle)
            clickedKeyframeHandle.isHeld = false
            clickedKeyframeHandle.highlight = false
            clickedKeyframeHandle = undefined
        }
        console.log(findKeyIndexForFrame(frameNumber, 'x'))

        dragLeftTimeline = false
        mouseAboveUpper = false
        mouseBelowLower = false
    }

    timeline.mouseDragged = () => {
        if (clickInitiatedInTimeline) {
            timeline.setFrameFromMouse()
            // if (!dragLeftTimeline && timeline.mouseX > timeline.width) {
            //     page++
            //     dragLeftTimeline = true
            //     if (dragLeftTimeline) clickedKeyframeHandle.page++
            // }
            // if (!dragLeftTimeline && timeline.mouseX < timelineXOffset && page > 1) {
            //     page--
            //     dragLeftTimeline = true
            //     if (dragLeftTimeline) clickedKeyframeHandle.page--
            // }
            if (!mouseAboveUpper) {
                if (timeline.mouseX > timeline.width) {
                    mouseAboveUpper = true
                    timeline.mouseDraggedOut(true)
                }
            } else {
                if (timeline.mouseX < timeline.width) {
                    mouseAboveUpper = false
                    //timeline.mouseDraggedIn(false)
                }
            }

            if (!mouseBelowLower) {
                if (timeline.mouseX < gridX0) {
                    mouseBelowLower = true
                    timeline.mouseDraggedOut(false)
                }
            } else {
                if (timeline.mouseX > gridX0) {
                    mouseBelowLower = false
                    //timeline.mouseDraggedIn(true)
                }
            }
            // console.log('page: ' + clickedKeyframeHandle.page + ', frame: ' + clickedKeyframeHandle.frameNum + ', x: ' + clickedKeyframeHandle.x)
        }
        if (clickedKeyframeHandle) {
            // let newX = timeline.mouseX > timelineXOffset ? timeline.mouseX : timeline.mouseX < timelineXOffset && page == 1 ? timelineXOffset : timeline.mouseX
            let newX = timeline.mouseX
            // console.log(newX)
            clickedKeyframeHandle.move(newX)
            clickedKeyframeHandle.isHeld = true
            animatedProperties[clickedKeyframeHandle.prop] = clickedKeyframeHandle.value
        }
    }

    timeline.getPageFromFrame = (frame) => {
        return Math.floor(frame / framesPerPage) + 1
    }

    timeline.pageChangeListener = () => {
        const newPage = timeline.getPageFromFrame(frameNumber)
        if (newPage !== page) timeline.changePage(newPage)
    }

    timeline.changePage = (newPage) => {
        page = newPage
        pageChangeAniStartFrame = timeline.frameCount
    }

    timeline.scrollPage = (up) => {
        dragLeftTimeline = true
        // pageChangeAniRunning = true
        if (up) {
            timeline.changePage(page + 1)
            setFrameNumber((page * framesPerPage) - framesPerPage)
        }
        else {
            if (page > 1) {
                timeline.changePage(page - 1)
                setFrameNumber((page * framesPerPage) - 1)
            }
        }
        console.log('pasd ' + page)
    }

    timeline.mouseDraggedOut = (side) => {
        //side is boolean; true is right bound, false is left
        timeline.scrollPage(side)
    }
    timeline.mouseDraggedIn = (side) => {
        timeline.scrollPage(side)
    }

    timeline.keyPressed = () => {
        if (clickedKeyframeHandle) {
            if (keyCode === 88) {
                deleteKeyframe(clickedKeyframeHandle.keyframe, clickedKeyframeHandle.prop)
                clickedKeyframeHandle = undefined
            }
            if (keyCode === 73) {
                clickedKeyframeHandle.highlight = false
                changeInterp(clickedKeyframeHandle.keyframe, 'next')
            }
        }
    }


    timeline.isInTimeline = (x, y) => {
        return isInCanvas(x, y, tCanvas) && (x >= labelSectionWidth)
    }

    timeline.rescale = (newSize) => {
        timeline.resizeCanvas(newSize, timeline.height)
        for (let handle of keyframeHandles) {
            handle.x = timeline.frameNumToXCoord(handle.frameNum)
        }
    }

    timeline.createRescaleSlider = (startVal) => {
        const row = createDiv()
        const slider = createSlider(980, 1880, startVal, 60)
        const text = createSpan('Resize Timeline')
        parentElements(row, text, slider)

        row.style('white-space', 'nowrap')
        text.style('margin-right', '10px')

        slider.id('rescaleTSlider')
        slider.size(500)
        row.position(10, 30, 'relative')
        // slider.position(115, -18, 'relative')
        document.getElementById('rescaleTSlider').oninput = () => timeline.rescale(slider.value())
    }

    timeline.setup = () => {
        const tStartingWidth = window.innerWidth - 20
        // const tStartingWidth = 980
        // tCanvas = timeline.createCanvas(1880, 100)
        tCanvas = timeline.createCanvas(tStartingWidth, 150)
        timeline.createRescaleSlider(tStartingWidth)
        // rescaleTimelineSlider.changed(() => timeline.rescale(rescaleTimelineSlider.value()))

        /**
         * temporarily add keyframe handles using predefined keyframes
         * 
         */

        //updateKeyframeTHook = timeline.updateKeyframeHandle
        deleteKeyframeHandleTHook = timeline.deleteKeyframeHandle
        setKeyframeTHook = timeline.addKeyframeHandle
        pageChangeListenerTHook = timeline.pageChangeListener
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
        timeline.pageChangeTextAnimation()
    }

    timeline.frameNumToXCoord = (frame) => {
        let frameOnPage = frame % framesPerPage
        return ((timeline.width - labelSectionWidth) / framesPerPage) * frameOnPage + gridX0
    }

    timeline.xCoordToClosestFrameNum = (x) => {
        let pixelsPerDivision = (timeline.width - labelSectionWidth) / framesPerPage
        let f = (x - gridX0) / pixelsPerDivision
        let framesTimesPages = (page - 1) * framesPerPage
        // return x > (timeline.width - pixelsPerDivision) ? framesTimesPages + Math.floor(f) : framesTimesPages + Math.round(f)
        let a = x > (timeline.width - pixelsPerDivision) ? framesTimesPages + Math.floor(f) : framesTimesPages + Math.round(f)
        // console.log("ff: " + a)
        return a
    }

    timeline.setFrameFromMouse = () => {

        /**
         * add if cursor release on new keyframe only then update
         */

        if (timeline.isInTimeline(timeline.mouseX, timeline.mouseY)) {
            setFrameNumber(timeline.xCoordToClosestFrameNum(timeline.mouseX))
            updateTextBoxes('allProps', 'frameNumber')
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
        for (let i = 0; i < propsOrder.length; i++) {
            let y = (timeline.height / propsOrder.length) * i
            timeline.textAlign(LEFT, TOP)
            timeline.text(propsOrder[i], 10, y + 5)
            timeline.textAlign(RIGHT)
            timeline.text(origins[propsOrder[i]], gridX0 - 10, y + 5)
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
        } else page = timeline.getPageFromFrame(frameNumber)
        timeline.pop()
    }

    timeline.drawKeyframeHandles = () => {
        const colors = {
            linear: [165, 235, 225],
            expo1: [255, 255, 90],
            expo2: [255, 200, 120],
            expo3: [255, 165, 190],
            custom: [210, 170, 255]
        }
        timeline.push()
        for (let handle of keyframeHandles) {
            let color = colors.hasOwnProperty(handle.keyframe[2]) ? colors[handle.keyframe[2]] : colors.custom
            timeline.fill(...color)
            // console.log(handle.x)
            if (!handle.isHeld) {
                handle.show()
            }
        }
        //timeline.fill(140, 130, 220, 130)
        if (clickedKeyframeHandle) {
            let color = colors.hasOwnProperty(clickedKeyframeHandle.keyframe[2]) ? colors[clickedKeyframeHandle.keyframe[2]] : colors.custom
            timeline.fill(...color)
            clickedKeyframeHandle.show()
            if (clickedKeyframeHandle.highlight) {
                timeline.noStroke()
                timeline.fill(0, 90)
                clickedKeyframeHandle.show()
            }
        }
        timeline.pop()

        let isOverHandle = clickedKeyframeHandle || timeline.isInsideHandle(timeline.mouseX, timeline.mouseY)
        if (isOverHandle) {
            timeline.push()
            timeline.fill(250, 220)
            // console.log(isOverHandle.value)
            let offset = 8
            let x = isOverHandle.x + offset
            let tSize = timeline.textWidth(isOverHandle.value) + offset
            // console.log('width: ' + tSize)
            if (isOverHandle.x > timeline.width - (tSize + 2)) {
                timeline.textAlign(timeline.RIGHT)
                x = isOverHandle.x - offset
            }
            timeline.text(isOverHandle.value, x, isOverHandle.y + 8)
            timeline.pop()
        }
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

    //update displayed properties to neearest keyframe
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

function captureKeyframe(prop) {
    // console.log(textBoxes[prop])
    const value = parseInt(textBoxes[prop].value())
    if (isNaN(value)) return console.log('Could not add keyframe for property ' + prop)
    const frame = frameNumber
    const interp = getRadioSelection(prop)
    addKeyframe(prop, value, frame, interp)
}

function addKeyframe(prop, value, frame, interp) {
    const i = findKeyIndexForFrame(frame, prop)

    console.log('-- > i', i)

    keyframes[prop].splice(i, 0, [value, frame, interp])
    console.log(keyframes[prop])
    setKeyframeTHook(prop, i, value, frame, interp)
}

function findKeyIndexForFrame(frame, prop) {
    for (let i = 0; i < keyframes[prop].length; i++) {
        let nextFrame = keyframes[prop][i][1]
        if (frame < nextFrame) return i
    }
    return keyframes[prop].length
}

function updateKeyframe(keyframeIndex, prop, value, frame, interp) {
    //updateKeyframeTHook(keyframeIndex, prop, value, frame, interp)
    if (value !== undefined) keyframes[prop][keyframeIndex][0] = value
    if (frame !== undefined) keyframes[prop][keyframeIndex][1] = frame
    if (interp !== undefined) keyframes[prop][keyframeIndex][2] = interp
}

function reorderKeyframes(prop, startID, newID) {
    if (startID < newID) newID--
    if (startID !== newID) keyframes[prop].splice(newID, 0, keyframes[prop].splice(startID, 1)[0])
}

function deleteKeyframeHandleTHook() {
}

function deleteKeyframe(keyframe, prop) {
    deleteKeyframeHandleTHook(keyframe, prop)
    let i = keyframes[prop].indexOf(keyframe)
    console.log(i)
    console.log(keyframes[prop][i])
    keyframes[prop].splice(i, 1)
    console.log(keyframes[prop])
}

function changeInterp(keyframe, type) {
    let i
    if (type === 'next') {
        i = (interpTypes.indexOf(keyframe[2]) + 1) % interpTypes.length
    } else if (type === 'previous') {
        i = (interpTypes.indexOf(keyframe[2]) || interpTypes.length) - 1
    } else i = interpTypes.indexOf(type)
    keyframe[2] = interpTypes[i]
}

function exportKeyframes() {
    const keys = {}
    for (let prop in keyframes) {
        const renameString = textBoxes[prop + '_rename'].value()
        const newProp = renameString.length > 0 ? renameString : prop
        keys[newProp] = keyframes[prop]
    }
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([JSON.stringify(keys, null, 4)], { type: "application/json" }));
    a.href = url
    a.setAttribute("download", "keyframes.json");
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function test() {
    const keys = {}
    for (let prop in keyframes) {
        const renameString = textBoxes[prop + '_rename'].value()
        const newProp = renameString.length > 0 ? renameString : prop
        keys[newProp] = keyframes[prop]
    }
    return keys
}


