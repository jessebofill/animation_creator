

const canvas = {
    width: 400,
    height: 400
}

const animatedProperties = {
    x: 150,//canvas.width / 2,
    y: 150,//canvas.height / 2,
    r: 150,
    g: 150,
    b: 150,
    a: 255,
    t: 0,
    u: 0
}

const origins = structuredClone(animatedProperties)

const propValRelativeKey = {
    x: animatedProperties.x - origins.y,
    y: animatedProperties.x - origins.y,
    r: animatedProperties.r - origins.r,
    g: animatedProperties.g - origins.g,
    b: animatedProperties.b - origins.b,
    a: animatedProperties.a - origins.a,
    t: animatedProperties.t - origins.t,
    u: animatedProperties.u - origins.u,

}
const lastKeyValues = {
    x: origins.y,
    y: origins.y,
    r: origins.r,
    g: origins.g,
    b: origins.b,
    a: origins.a,
    t: origins.t,
    u: origins.u
}
const propOffsets = {
    x: animatedProperties.x - origins.y,
    y: animatedProperties.x - origins.y,
    r: animatedProperties.r - origins.r,
    g: animatedProperties.g - origins.g,
    b: animatedProperties.b - origins.b,
    a: animatedProperties.a - origins.a,
    t: animatedProperties.t - origins.t,
    u: animatedProperties.u - origins.u
}

const lastVals = {}

const propsOrder = ['x', 'y', 'r', 'g', 'b', 'a', 't', 'u']

const boundingBox = {
    w: 100,
    h: 100,
    show: true,
    rectMode: 'corner'
}

const alphaBackground = {
    r: 150,
    g: 100,
    b: 100,
}

let visualizeColorOnBackground = true

let keyframes = {
    x: [],//, [300, 50, 'expo1'], [0, 80, 'expo2']],
    y: [],
    r: [],
    g: [],
    b: [],
    a: [],
    t: [],
    u: [],

}
let keyframesRel = {
    x: [],//, [300, 50, 'expo1'], [0, 80, 'expo2']],
    y: [],
    r: [],
    g: [],
    b: [],
    a: [],
    t: [],
    u: [],
}

const interpTypes = ['linear', 'expo1', 'expo2', 'expo3']

let animationMode = 'absolute'

const playback = {
    isRunning: false,
    holdLastVal: false,
    frameRate: 60,
    frameNumber: 0
}

const textBoxes = {
    frameNumber: {}
}

let newAnimation

const lastValDrag = {}

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
        if ((string.charCodeAt(i) === 46 && mode === 1) || string.charCodeAt(i) === 45) continue
        if (isNaN(parse(string.charAt(i)))) return false
    }
    return true
}

function updateElementsOnFrameSet() {
    updateTextBoxes('allAbs', 'frameNumber')
    updateTextBoxes('allRel')
    updateSliders()
}

function updateSliders() {
    document.getElementById('r_slider').value = animatedProperties.r
    document.getElementById('g_slider').value = animatedProperties.g
    document.getElementById('b_slider').value = animatedProperties.b
    document.getElementById('a_slider').value = animatedProperties.a
}

function updateTextBoxes(...props) {
    if (props[0] === 'allAbs') {
        for (let prop in animatedProperties) {
            setTextBoxValue(textBoxes[prop], animatedProperties[prop])
            // propValRelativeKey[prop] = animatedProperties[prop] - lastKeyValues[prop]
            // setTextBoxValue(textBoxes[prop + 'Rel'], propValRelativeKey[prop])
        }
        props.splice(0, 1)
    }
    if (props[0] === 'allRel') {
        for (let prop in animatedProperties) {
            // propValRelativeKey[prop] = animatedProperties[prop] - lastKeyValues[prop]
            setTextBoxValue(textBoxes[prop + 'Rel'], propValRelativeKey[prop])
        }
        props.splice(0, 1)
    }
    for (let prop of props) {
        if (prop === 'frameNumber') {
            setTextBoxValue(textBoxes[prop], frameNumber)
        } else if (prop.slice(1) === 'Rel') {
            setTextBoxValue(textBoxes[prop], propValRelativeKey[prop.charAt(0)])
        } else setTextBoxValue(textBoxes[prop], animatedProperties[prop])
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
    box.class('disableable')

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

function createRGBASliderRow() {
    const row = createDiv()
    const rSlider = createSlider(0, 255, animatedProperties.r, 1)
    const gSlider = createSlider(0, 255, animatedProperties.g, 1)
    const bSlider = createSlider(0, 255, animatedProperties.b, 1)
    const aSlider = createSlider(0, 255, animatedProperties.a, 1)

    rSlider.class('disableable')
    gSlider.class('disableable')
    bSlider.class('disableable')
    bSlider.class('disableable')

    rSlider.id('r_slider')
    gSlider.id('g_slider')
    bSlider.id('b_slider')
    aSlider.id('a_slider')

    rSlider.size(160)
    gSlider.size(160)
    bSlider.size(160)
    aSlider.size(160)

    rSlider.style('margin-right', '20px')
    gSlider.style('margin-right', '20px')
    bSlider.style('margin-right', '20px')

    const rLabel = createSpan('r:')
    const gLabel = createSpan('g:')
    const bLabel = createSpan('b:')
    const aLabel = createSpan('a:')

    rLabel.style('margin-right', '8px')
    gLabel.style('margin-right', '8px')
    bLabel.style('margin-right', '8px')
    aLabel.style('margin-right', '8px')

    const props = ['r', 'g', 'b', 'a']
    for (let prop of props) {
        const element = document.getElementById(prop + '_slider')
        element.oninput = () => {
            animatedProperties[prop] = parseInt(element.value)
            propValRelativeKey[prop] = animatedProperties[prop] - lastKeyValues[prop]
            updateTextBoxes(prop)
            updateTextBoxes(prop + 'Rel')
        }
    }


    parentElements(row, rLabel, rSlider, gLabel, gSlider, bLabel, bSlider, aLabel, aSlider,)
    return row
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
    const alphaSlider = document.getElementById('a_slider')
    alphaBox.disabled = true
    alphaSlider.disabled = true
    const toggleColorMode = () => {
        // boundingBox.rectMode = boundingBox.rectMode === 'corner' ? 'center' : 'corner'
        visualizeColorOnBackground = document.querySelector('input[name="colorMode"]:checked').value === 'canvas'
        if (!playback.isRunning) {
            alphaBox.disabled = visualizeColorOnBackground
            alphaSlider.disabled = visualizeColorOnBackground
        }
    }
    element.onchange = toggleColorMode


    const alphaBGSpan = createSpan()
    const colorSwatch = createSpan()
    colorSwatch.style('display', 'inline-block')
    colorSwatch.id('color_swatch')
    colorSwatch.size(35, 17)
    colorSwatch.position(0, 3, 'relative')
    colorSwatch.style('background-color', `rgb(${alphaBackground.r},${alphaBackground.g},${alphaBackground.b})`)

    const alphaBGText = createSpan('Alpha BG color')
    const button = createButton('Set')
    button.class('disableable')

    button.mousePressed(() => {
        ({ r: alphaBackground.r, g: alphaBackground.g, b: alphaBackground.b } = animatedProperties)
        colorSwatch.style('background-color', `rgb(${alphaBackground.r},${alphaBackground.g},${alphaBackground.b})`)
    })

    alphaBGText.style('margin-right', '8px')
    alphaBGText.style('margin-left', '8px')
    parentElements(alphaBGSpan, colorSwatch, alphaBGText, button)

    radioSpan.style('margin-right', '22px')
    parentElements(span, radioSpan, alphaBGSpan)
    return span
}


function createFrameNumberInput() {
    const span = createSpan()

    const setFps = createFrameRateInput()
    setFps.style('margin-right', '30px')

    const box = createInput()
    textBoxes.frameNumber = box
    box.id('frameInput')
    box.value(frameNumber)
    box.size(50)
    box.attribute('placeholder', 'frame')
    box.style('margin-right', '8px')

    const button = createButton('Go to frame')
    button.style('margin-right', '20px')
    button.class('disableable')

    const hanldeValidValue = (value) => {
        const frame = value
        setFrameNumber(frame);
        pageChangeListenerTHook()
        playback.holdLastVal = false
    }

    textBoxSetup(box, value => value >= 0 && isParsedNum(value, 0), hanldeValidValue, button)
    parentElements(span, setFps, box, button)

    return span
}

function createSaveLoadExport() {
    const span = createSpan()

    const saveButton = createButton('Save')
    const loadButton = createInput()
    saveButton.class('disableable')
    loadButton.class('disableable')
    loadButton.attribute('type', 'file')
    loadButton.changed(loadAnimation2)
    // const loadButton = createFileInput(loadAnimation)
    saveButton.mousePressed(saveAnimation)

    saveButton.style('margin-right', '10px')
    // loadButton.style('margin-right', '25px')

    const exportButton = createButton('Export Keyframes')
    exportButton.style('margin-right', '20px')
    exportButton.class('disableable')
    exportButton.mousePressed(exportKeyframes)

    parentElements(span, saveButton, loadButton, exportButton)
    return span
}

function createBoundingBoxSettings() {
    const span = createSpan()

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

function createSaveLoadExportSpan(){
    const span = createSpan()
    const saveButton = createButton('Save')
    const loadButton = createInput()
    loadButton.attribute('type', 'file')
    loadButton.changed(loadAnimation2)
    // const loadButton = createFileInput(loadAnimation)
    saveButton.mousePressed(saveAnimation)

    saveButton.style('margin-right', '10px')

    parentElements(span, saveButton, loadButton)
    return span
}



function createUtilityRow() {
    const row = createDiv()
    row.style('display', 'flex')

    const resizeCanvasSpan = createResizeCanvasSpan()
    const rectModeSpan = createBoundingBoxSettings()
    const exportButton = createSaveLoadExport()


    resizeCanvasSpan.style('flex', '2')
    resizeCanvasSpan.style('text-align', 'left')
    resizeCanvasSpan.style('white-space', 'nowrap')
    resizeCanvasSpan.style('margin-left', '10px')

    rectModeSpan.style('text-align', 'center')
    rectModeSpan.style('flex', '7')
    rectModeSpan.style('white-space', 'nowrap')

    exportButton.style('text-align', 'right')
    exportButton.style('flex', '3')
    exportButton.style('white-space', 'nowrap')
    exportButton.style('margin-right', '10px')




    parentElements(row, resizeCanvasSpan, rectModeSpan, exportButton)
    return row
}

function createAniModeSpan() {
    const span = createSpan()

    const aniModeText1 = createSpan('Animation Mode:')
    aniModeText1.id('aniMode_span')

    const aniModeRadio = createRadio('aniModeRadio')
    aniModeRadio.hide()
    radios.aniMode = aniModeRadio
    aniModeRadio.option('absolute', 'absolute')
    aniModeRadio.option('relative', 'relative')
    aniModeRadio.selected(animationMode)
    aniModeText1.html(aniModeRadio.html(), true)

    document.getElementById('aniMode_span').onchange = toggleAnimationMode


    parentElements(span, aniModeText1)
    return span
}

function createFrameRateInput() {
    const span = createSpan()
    const text = createSpan('Frame Rate')
    const box = createInput()
    textBoxes.fps = box
    box.attribute('placeholder', 'FPS')
    box.size(50)
    box.id('fpsbox')

    text.style('margin-right', '8px')

    const handle = value => {
        playback.frameRate = parseInt(value)
    }

    const validate = value => {
        const val = parseInt(value)
        return isParsedNum(value, 0) && val > 0 && val <= 60
    }

    textBoxSetup(box, validate, handle)

    parentElements(span, text, box)
    return span
}

function createUtilityRow2() {
    const row = createDiv()
    row.style('display', 'flex')

    const aniModeSpan = createAniModeSpan()
    const colorVisualizer = createVizualizeColorSpan()
    const frameSet = createFrameNumberInput()

    aniModeSpan.style('flex', '2')
    aniModeSpan.style('text-align', 'left')
    aniModeSpan.style('white-space', 'nowrap')
    aniModeSpan.style('margin-left', '10px')

    colorVisualizer.style('flex', '6')
    colorVisualizer.style('text-align', 'center')
    colorVisualizer.style('white-space', 'nowrap')

    frameSet.style('flex', '2')
    frameSet.style('text-align', 'right')
    frameSet.style('white-space', 'nowrap')
    frameSet.style('margin-right', '10px')

    parentElements(row, aniModeSpan, colorVisualizer, frameSet)
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

function createPropTextBoxAbs(prop, size, x1) {
    const box = createInput()
    textBoxes[prop] = box
    box.value(animatedProperties[prop])
    box.attribute('placeholder', prop)
    box.position(x1)
    box.size(...size)
    box.id(prop + 'box')


    const hanldeValidValue = (value) => {
        animatedProperties[prop] = value
        propValRelativeKey[prop] = value - lastKeyValues[prop]
        updateTextBoxes(prop + 'Rel')
        updateSliders()
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

function createPropTextBoxRel(prop, size, x1) {
    const box = createInput()
    textBoxes[prop + 'Rel'] = box
    box.value(propValRelativeKey[prop])
    box.attribute('placeholder', 'Δ' + prop)
    box.position(x1)
    box.size(...size)
    box.id(prop + 'relBox')


    const hanldeValidValue = (value) => {
        propValRelativeKey[prop] = value
        animatedProperties[prop] = value + lastKeyValues[prop]
        updateTextBoxes(prop)
        updateSliders()
    }

    const parseMode = prop === 't' || prop === 'u' ? 1 : 0
    let validation
    if (prop == 'r' || prop == 'g' || prop == 'b' || prop == 'a') {
        validation = (val) => {
            return isParsedNum(val, parseMode) && val >= 0 - lastKeyValues[prop] && val <= 255 - lastKeyValues[prop]
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



function createPropsSectionHeader(x1, x2, x, x3, x4, x5, x6, x7, x8, radioMargin) {
    const row = createDiv()
    row.style('margin-bottom', '45px')

    const propName = createSpan('Prop')
    const abs1 = createSpan('Absolute')
    const abs2 = createSpan('Value')
    const rel1 = createSpan('Relative')
    const rel2 = createSpan('Last Keyframe')
    const originButton = createButton('Set Origins')
    const addKey1 = createSpan('Add/ Update')
    const addKey2 = createSpan('Keyframe')
    const interpType = createSpan('Interpolation Type')
    const linear = createSpan('linear')
    const expo1 = createSpan('expo1')
    const expo2 = createSpan('expo2')
    const expo3 = createSpan('expo3')
    const addAllButton = createButton('Key All')
    const exportText = createSpan('Export')
    const rename = createSpan('Export As')

    originButton.class('disableable')
    addAllButton.class('disableable')
    propName.position(x1)
    abs1.position(x2)
    abs2.position(x2, 20)
    rel1.position(x)
    rel2.position(x, 20)
    originButton.position(x3 - 10)
    interpType.position(x4)
    linear.position(x4, 25)
    expo1.position(x4 + radioMargin, 25)
    expo2.position(x4 + radioMargin * 2, 25)
    expo3.position(x4 + radioMargin * 3, 25)
    addKey1.position(x5)
    addKey2.position(x5, 20)
    addAllButton.position(x6)
    exportText.position(x7)
    rename.position(x8, 25)

    abs1.id('valueLine1')
    abs2.id('valueLine2')

    originButton.size(60, 40)
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

    parentElements(row, propName, abs1, abs2, rel1, rel2, originButton, interpType, linear, addKey1, addKey2, expo1, expo2, expo3, addAllButton, exportText, rename)
    return row
}

function createKeyframeButtons(prop, x1, x2, row) {
    const button = createButton('Keyframe')
    button.position(x1)
    button.class('disableable')
    button.mousePressed(() => captureKeyframe(prop))
    if (prop === 'x') {
        const allCoords = createButton('Key All Coords')
        allCoords.class('disableable')
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
        allColors.class('disableable')
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
        allOthers.class('disableable')
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
        if (element.checked) {
            origins[prop] = animatedProperties[prop]
        }
    }
}

function createSetOrigins(prop, x) {
    const id = prop + '_originCheck'
    const checkHtml = '<label><input type="checkbox" id="' + id + '" style="position: absolute; left: ' + (x + 20) + 'px;"></label>'

    return checkHtml
}

function createExportCheck(prop, x) {
    const id = prop + '_exportCheck'
    const checkHtml = '<label><input type="checkbox" id="' + id + '" style="position: absolute; left: ' + x + 'px;"></label>'

    return checkHtml
}

function createPropEditorDiv() {
    const interpColors = [
        '165, 235, 225',
        '255, 255, 90',
        '255, 200, 120',
        '255, 165, 190'
    ]
    const x = [65, 110, 185, 0, 300, 390, 470, 720, 750]
    const inputBoxSize = [30, 15]
    const radioMargin = 48
    const container = createDiv()
    for (let i = 0; i < 4; i++) {
        const rectangle = createDiv().style('background', 'rgb(' + interpColors[i] + ')')
        rectangle.size(48, 243)
        rectangle.position(x[6] + 48 * i - 5, 24)
        parentElements(container, rectangle)
    }

    const rows = [createPropsSectionHeader(x[0], x[1], x[2], x[3], x[6], x[4], x[5], x[7], x[8], radioMargin)]
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
        const absBox = createPropTextBoxAbs(prop, inputBoxSize, x[1])
        const relBox = createPropTextBoxRel(prop, inputBoxSize, x[2])
        const originCheck = createSetOrigins(prop, x[3])
        const keyButtons = createKeyframeButtons(prop, x[4], x[5], row)
        const renamePropBox = createRenamePropOnExportTextBox(prop, x[8])
        const exportCheck = createExportCheck(prop, x[7])

        propName.position(x[0], 0, 'relative')

        parentElements(row, propName, absBox, relBox, keyButtons, renamePropBox)

        //add html radio tags back
        row.html(radioHTML, true)
        row.html(originCheck, true)
        row.html(exportCheck, true)

        rows.push(row)
    }

    document.querySelectorAll('input[type="radio"]').forEach((element) => {
        element.style.marginLeft = '0px';
        element.style.position = 'absolute';
        element.style.left = x[6] + radioMargin * interpTypes.indexOf(element.value) + 'px';
    })

    const rgbaSliders = createRGBASliderRow()
    rgbaSliders.style('margin-top', '40px')

    parentElements(container, ...rows, rgbaSliders)
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
    // frameRate(1) 

    const timeline = createTCanvas()
    const rightOfCanvas = createPropEditorDiv()
    const utilityRow = createUtilityRow()
    const utilityRow2 = createUtilityRow2()

    resizeCanvasWrapper = (w, h) => {
        console.log('resize')
        resizeCanvas(w, h)
        rightOfCanvas.position(w + 40, 20)
    }

    timeline.position(0, 70, 'relative')
    rightOfCanvas.position(canvas.width + 40, 20)
    utilityRow.position(0, -165, 'relative')
    utilityRow2.position(0, -155, 'relative')


    // row_3.position(0, 20, 'relative')
    // row_4.position(0, 20, 'relative')
    // row_5.position(0, 20, 'relative')
}

function draw() {
    newAnimation?.animate()

    let x, y, r, g, b, a
    // if (animationMode === 'absolute' || playback.holdLastVal) {
    if (true) {
        x = animatedProperties.x
        y = animatedProperties.y
        r = animatedProperties.r
        g = animatedProperties.g
        b = animatedProperties.b
        a = animatedProperties.a
    } else {
        r = origins.r + propOffsets.r
        g = origins.g + propOffsets.g
        b = origins.b + propOffsets.b
        a = origins.a + propOffsets.a
        x = origins.x + propOffsets.x
        y = origins.y + propOffsets.y
    }

    if (visualizeColorOnBackground) background(r, g, b);
    else background(alphaBackground.r, alphaBackground.g, alphaBackground.b);
    noStroke()
    if (playback.isRunning && newAnimation.animationFrame) {
        setFrameNumber(newAnimation.animationFrame)
        pageChangeListenerTHook()
        playback.frameNumber++
    }

    if (boundingBox.show) {
        if (visualizeColorOnBackground) fill(255, 70)
        else fill(animatedProperties.r, animatedProperties.g, animatedProperties.b, animatedProperties.a)

        rect(x, y, boundingBox.w, boundingBox.h)
    }
    stroke(40, 200)
    line(x - 5, y, x + 5, y)
    line(x, y - 5, x, y + 5)
    // push()
    // fill(0)
    // text('absolute x: ' + x, 200, 350)
    // pop()
}


function keyPressed() {
    if (keyCode == 32) {
        if (playback.isRunning) stopPlayback()
        else startPlayback()
    }
}

function mousePressed() {
    if (!playback.isRunning) {
        clickInitiatedInMainCanvas = isInCanvas(mouseX, mouseY, mainCanvas) ? true : false

        if (animationMode == 'relative') {
            animatedProperties.x = propOffsets.x + origins.x
            animatedProperties.y = propOffsets.y + origins.y
        }
        clickXOffset = Math.round(mouseX) - animatedProperties.x
        clickYOffset = Math.round(mouseY) - animatedProperties.y
    }
}

function mouseReleased() {
    if (!mouseWasDragged) {
        setCrosshairToMouse()
    }
    mouseWasDragged = false
}


function setCrosshairToMouse() {
    if (clickInitiatedInMainCanvas) {
        const newX = Math.round(mouseX)
        const newY = Math.round(mouseY)
        animatedProperties.x = newX
        animatedProperties.y = newY
        propValRelativeKey.x = newX - lastKeyValues.x
        propValRelativeKey.y = newY - lastKeyValues.y
        updateTextBoxes('x', 'y', 'xRel', 'yRel')
    }
}

function mouseDragged() {
    if (!playback.isRunning) {

        if (clickInitiatedInMainCanvas) {
            mouseWasDragged = true

            const newX = Math.round(mouseX) - clickXOffset
            const newY = Math.round(mouseY) - clickYOffset
            animatedProperties.x = newX
            animatedProperties.y = newY
            propValRelativeKey.x = newX - lastKeyValues.x
            propValRelativeKey.y = newY - lastKeyValues.y
            updateTextBoxes('x', 'y', 'xRel', 'yRel')
        }
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
            if (handle.keyframe[1] === frame) handlesAtFrame.push(handle)
        }
        return handlesAtFrame
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

    timeline.addKeyframeHandle = (prop, keyframe, relKey) => {
        let rowHeight = timeline.height / propsOrder.length
        let y = rowHeight * propsOrder.indexOf(prop) + rowHeight / 2
        let x = timeline.frameNumToXCoord(keyframe[1])
        keyframeHandles.push(new KeyframeHandle(keyframe, x, y, prop, relKey))
    }

    timeline.deleteKeyframeHandle = (keyframe, prop) => {
        //clickedKeyframeHandle = undefined
        let i = keyframeHandles.findIndex((handle) => handle.keyframe === keyframe && prop === handle.prop)
        console.log('handle: ' + i)
        keyframeHandles.splice(i, 1)
    }

    timeline.deleteAllHandles = () => {
        keyframeHandles = []
    }

    timeline.createHandlesFromKeyframes = () => {
        for (let prop in keyframes) {
            for (let i = 0; i < keyframes[prop].length; i++) {
                timeline.addKeyframeHandle(prop, keyframes[prop][i], keyframesRel[prop][i])
            }
        }
    }

    class KeyframeHandle {
        constructor(keyframe, x, y, prop, relKey) {
            this.keyframe = keyframe
            this.keyframeRel = relKey
            this.x = x
            this.y = y
            this.d = 9
            // this.frameNum = frame
            this.prop = prop
            // this.keyframeIndex = index
            // this.value = value

            this.page = timeline.getPageFromFrame(keyframe[1])
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
            let existingHandleIndex = findKeyIndexAtFrame(newFrame, this.prop)
            let thisHandleCurrentIndex = findKeyIndexAtFrame(this.keyframe[1], this.prop)
            if (existingHandleIndex !== -1 && existingHandleIndex !== thisHandleCurrentIndex) deleteKeyframe(keyframeHandles[existingHandleIndex].keyframe, this.prop)
            // console.log('-- > KeyframeHandle > existingHandleIndex', existingHandleIndex)

            this.keyframe[1] = newFrame
            this.keyframeRel[1] = newFrame
            // this.keyframe[1] = this.keyframe[1]
            let nearestID = findKeyIndexForFrame(this.keyframe[1], this.prop)
            reorderKeyframes(this.prop, thisHandleCurrentIndex, nearestID)
            // console.log('frame: ' + this.keyframe[1])
            // console.log('new: ' + nearestID)
            // updateKeyframe(this.keyframeIndex, this.prop, undefined, this.keyframe[1])
            // console.log(keyframes[this.prop])
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
        if (!playback.isRunning) {
            clickedKeyframeHandle = timeline.isInsideHandle(timeline.mouseX, timeline.mouseY)
            if (clickedKeyframeHandle) clickedKeyframeHandle.highlight = true
            clickInitiatedInTimeline = timeline.isInTimeline(timeline.mouseX, timeline.mouseY) || clickedKeyframeHandle ? true : false
            if (clickInitiatedInTimeline) timeline.setFrameFromMouse()
        }

    }

    timeline.mouseReleased = () => {
        if (clickedKeyframeHandle) {
            clickedKeyframeHandle.updateAfterDrag()
            // console.log('-- > clickedKeyframeHandle', clickedKeyframeHandle)
            clickedKeyframeHandle.isHeld = false
            clickedKeyframeHandle.highlight = false
            clickedKeyframeHandle = undefined
        }
        // console.log(findKeyIndexForFrame(frameNumber, 'x'))

        dragLeftTimeline = false
        mouseAboveUpper = false
        mouseBelowLower = false
    }

    timeline.mouseDragged = () => {
        if (!playback.isRunning) {
            if (clickInitiatedInTimeline) {

                timeline.setFrameFromMouse()
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
                // console.log('page: ' + clickedKeyframeHandle.page + ', frame: ' + clickedKeyframeHandle.keyframe[1] + ', x: ' + clickedKeyframeHandle.x)
            }
            if (clickedKeyframeHandle) {
                // let newX = timeline.mouseX > timelineXOffset ? timeline.mouseX : timeline.mouseX < timelineXOffset && page == 1 ? timelineXOffset : timeline.mouseX
                let newX = timeline.mouseX
                // console.log(newX)
                clickedKeyframeHandle.move(newX)
                clickedKeyframeHandle.isHeld = true
                animatedProperties[clickedKeyframeHandle.prop] = clickedKeyframeHandle.keyframe[0]
                updateTextBoxes(clickedKeyframeHandle.prop)
                updateSliders()

            }
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
                changeInterp(clickedKeyframeHandle.keyframe, clickedKeyframeHandle.keyframeRel, 'next')
            }
        }
    }


    timeline.isInTimeline = (x, y) => {
        return isInCanvas(x, y, tCanvas) && (x >= labelSectionWidth)
    }

    timeline.rescale = (newSize) => {
        timeline.resizeCanvas(newSize, timeline.height)
        for (let handle of keyframeHandles) {
            handle.x = timeline.frameNumToXCoord(handle.keyframe[1])
        }
    }

    timeline.createRescaleSlider = (startVal) => {
        const row = createDiv()
        const slider = createSlider(980, 1880, startVal, 60)
        const text = createSpan('Resize Timeline')
        parentElements(row, text, slider)

        slider.class('disableable')
        row.style('white-space', 'nowrap')
        text.style('margin-right', '10px')

        slider.id('rescaleTSlider')
        slider.size(500)
        row.position(10, 80, 'relative')
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

        updateKeyframeTHook = timeline.updateKeyframeHandle
        deleteKeyframeHandleTHook = timeline.deleteKeyframeHandle
        deleteAllHandlesTHook = timeline.deleteAllHandles
        addKeyframeTHook = timeline.addKeyframeHandle
        pageChangeListenerTHook = timeline.pageChangeListener
        loadAnimationTHook = timeline.createHandlesFromKeyframes
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
            playback.holdLastVal = false
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
            let tSize = timeline.textWidth(isOverHandle.keyframe[0]) + offset
            // console.log('width: ' + tSize)
            if (isOverHandle.x > timeline.width - (tSize + 2)) {
                timeline.textAlign(timeline.RIGHT)
                x = isOverHandle.x - offset
            }
            timeline.textSize(9)
            timeline.text(isOverHandle.keyframe[0], x, isOverHandle.y - 2)
            timeline.text(isOverHandle.keyframeRel[0] + ' Δ', x, isOverHandle.y + 8)
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
    if (!playback.isRunning) {
        let k = ['x']
        //update displayed properties to neearest keyframe
        for (let prop of propsOrder) {
            const propKeys = [[origins[prop], 0]].concat(keyframes[prop])
            const closestKeyI = propKeys.findIndex((key, i, keys) => {
                return i === propKeys.length - 1 || (f >= key[1] && f < keys[i + 1][1])
            })

            const closestKey = propKeys[closestKeyI]
            const newAbs = closestKey[0]
            // propValRelativeKey[prop] = 0

            lastKeyValues[prop] = closestKey[1] === f ? propKeys[closestKeyI - 1][0] : newAbs
            animatedProperties[prop] = newAbs
            propValRelativeKey[prop] = animatedProperties[prop] - lastKeyValues[prop]
        }
    }
    updateElementsOnFrameSet()
}

function addKeyframeTHook() {
}

function updateKeyframeTHook() {
}

function captureKeyframe(prop) {
    // console.log(textBoxes[prop])
    const absVal = parseFloat(textBoxes[prop].value())
    const relVal = parseFloat(textBoxes[prop + 'Rel'].value())
    if (isNaN(absVal) || isNaN(relVal)) return console.log('Could not add keyframe for property ' + prop)
    const frame = frameNumber
    const interp = getRadioSelection(prop)
    setKeyframe(prop, absVal, frame, interp, relVal)
}

function setKeyframe(prop, absValue, frame, interp, relValue) {
    const keyframeAbs = [absValue, frame, interp]
    const keyframeRel = [relValue, frame, interp]
    const i = findKeyIndexForFrame(frame, prop)
    const keyIndexAtFrame = findKeyIndexAtFrame(frame, prop)
    if (keyIndexAtFrame > -1) {
        updateKeyframe(keyIndexAtFrame, prop, absValue, interp, relValue)
    } else {
        keyframes[prop].splice(i, 0, keyframeAbs)
        keyframesRel[prop].splice(i, 0, keyframeRel)
        addKeyframeTHook(prop, keyframeAbs, keyframeRel)
    }
}

function findKeyIndexForFrame(frame, prop) {
    for (let i = 0; i < keyframes[prop].length; i++) {
        let nextFrame = keyframes[prop][i][1]
        if (frame < nextFrame) return i
    }
    return keyframes[prop].length
}

function findKeyIndexAtFrame(frame, prop) {
    for (let i = 0; i < keyframes[prop].length; i++) {
        if (frame === keyframes[prop][i][1]) {
            console.log('I: ' + i)
            return i
        }
    }
    console.log('I: ' + -1)
    return -1
}

function updateKeyframe(keyframeIndex, prop, value, interp, relVal) {
    if (value !== undefined) {
        keyframes[prop][keyframeIndex][0] = value
        keyframesRel[prop][keyframeIndex][0] = relVal
    }
    if (interp !== undefined) {
        keyframes[prop][keyframeIndex][2] = interp
        keyframesRel[prop][keyframeIndex][2] = interp
    }
}

function reorderKeyframes(prop, startID, newID) {
    if (startID < newID) newID--
    if (startID !== newID) {
        keyframes[prop].splice(newID, 0, keyframes[prop].splice(startID, 1)[0])
        keyframesRel[prop].splice(newID, 0, keyframesRel[prop].splice(startID, 1)[0])
    }
    updateRelativeKeyframes(prop)
}

function deleteKeyframeHandleTHook() {
}

function deleteAllHandlesTHook() {

}

function deleteKeyframe(keyframe, prop) {
    deleteKeyframeHandleTHook(keyframe, prop)
    let i = keyframes[prop].indexOf(keyframe)
    keyframes[prop].splice(i, 1)
    keyframesRel[prop].splice(i, 1)
}

function changeInterp(keyframe, relKey, type) {
    let i
    if (type === 'next') {
        i = (interpTypes.indexOf(keyframe[2]) + 1) % interpTypes.length
    } else if (type === 'previous') {
        i = (interpTypes.indexOf(keyframe[2]) || interpTypes.length) - 1
    } else i = interpTypes.indexOf(type)
    keyframe[2] = interpTypes[i]
    relKey[2] = interpTypes[i]
}

function exportKeyframes() {
    const keys = {}
    for (let prop in keyframes) {
        if (!document.getElementById(prop + '_exportCheck').checked) continue
        const renameString = textBoxes[prop + '_rename'].value()
        const newProp = renameString.length > 0 ? renameString : prop
        keys[newProp] = animationMode === 'absolute' ? keyframes[prop] : keyframesRel[prop]
    }
    const blob = new Blob([JSON.stringify(keys, null, 4)], { type: "application/json" })
    saveAs(blob, 'export')
    // const a = document.createElement("a");
    // const url = URL.createObjectURL(blob);
    // a.href = url
    // a.setAttribute("download", "keyframes.json");
    // document.body.appendChild(a);
    // a.click();
    // window.URL.revokeObjectURL(url);
    // document.body.removeChild(a);
}


function saveAnimation() {
    const saveData = {
        absolute: keyframes,
        relative: keyframesRel,
        canvas: canvas,
        aniMode: animationMode,
        origins: origins,
        box: boundingBox,
        colorMode: visualizeColorOnBackground,
        aBG: alphaBackground
    }
    const blob = new Blob([JSON.stringify(saveData, null, 4)], { type: "application/json" })
    saveAs(blob, 'saveData')
}

async function saveAs(blob, type) {

    const fileType = {
        export: {
            types: [{
                description: "JSON",
                accept: { "application/json": [".json"] }
            }]
        },
        saveData: {
            types: [{
                description: "Animation Editor Save File",
                accept: { "application/json": [".aniSav"] }
            }]
        }
    }
    const fileHandle = await window.showSaveFilePicker(fileType[type]);

    const fileStream = await fileHandle.createWritable();
    await fileStream.write(blob);
    await fileStream.close();
}

function loadAnimation(save_file) {
    console.log(save_file)
    keyframes = save_file.data.absolute
    keyframesRel = save_file.data.relative
    loadAnimationTHook()
}
function loadAnimation2(save_file) {

    const file = save_file.target.files[0];

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
        const parsedObj = JSON.parse(readerEvent.target.result)
        console.log('-- > parsedObj', parsedObj)

        keyframes = parsedObj.absolute
        keyframesRel = parsedObj.relative
        animationMode = parsedObj.aniMode
        visualizeColorOnBackground = parsedObj.colorMode
        Object.assign(canvas, parsedObj.canvas)
        Object.assign(origins, parsedObj.origins)
        Object.assign(boundingBox, parsedObj.box)
        Object.assign(alphaBackground, parsedObj.aBG)

        const vCheck = document.getElementById('showHitBox_check').firstElementChild.firstElementChild
        vCheck.checked = boundingBox.show

        const i = animationMode === 'absolute' ? 0 : 1
        document.getElementById('aniMode_span').children[i].children[0].checked = true
        document.getElementById('color_swatch').style.backgroundColor =`rgb(${alphaBackground.r},${alphaBackground.g},${alphaBackground.b})`

        loadAnimationTHook()
        setFrameNumber(1)
    }
}



function loadAnimationTHook() {

}

function pageChangeListenerTHook() {

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

function startPlayback() {
    disableInputs()
    const frameObj = {}
    for (let prop in keyframes) {
        if (keyframes[prop].length > 0)
            frameObj[prop] = keyframes[prop]
    }
    newAnimation = new Animation(animatedProperties, frameObj, animationMode === 'absolute' ? 'abs' : false)

    frameRate(playback.frameRate)
    newAnimation.startAt(origins)
    newAnimation.play().then(stopPlayback)
    playback.isRunning = true
    playback.holdLastVal = true
}

function stopPlayback() {
    if (playback.isRunning) newAnimation.cancel()
    playback.isRunning = false
    playback.frameNumber = 0
    frameRate(60)
    enableInputs()
}


function enableInputs() {

    document.querySelectorAll('.disableable').forEach((element) => {
        const alphaBox = document.getElementById('abox')
        const alphaSlider = document.getElementById('a_slider')
        if (element === alphaBox || element === alphaSlider) element.disabled = visualizeColorOnBackground
        else element.disabled = false
    })
}

function disableInputs() {
    document.querySelectorAll('.disableable').forEach((element) => {
        element.disabled = true
    })
}

function toggleAnimationMode() {
    animationMode = animationMode === 'absolute' ? 'relative' : 'absolute'
    deleteAllKeyframes()
}

function deleteAllKeyframes() {
    deleteAllHandlesTHook()
    for (let prop in keyframes) {
        keyframes[prop] = []
        keyframesRel[prop] = []
    }
}

function updateRelativeKeyframes(prop) {
    const keys = keyframes[prop]
    console.log('-- > keys', keys)

    let lastAbs = origins[prop]
    for (let i = 0; i < keys.length; i++) {
        keyframesRel[prop][i][0] = keys[i][0] - lastAbs
        lastAbs = keys[i][0]

    }
}
