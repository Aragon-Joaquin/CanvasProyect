import popUp from "./pop-up.js"; //!error irrelevante, me pide tener typescript pero funciona igual
"use strict";

/*  //TODO

//> boton de rehacer

//> poner colores

//> anular boton redo despues de usar el undo/clear

> cambiar cursor dependiendo la herramienta actual

!> balde

//> guardar grosor de pincel/goma

//> centrar el cursor en la goma

!> multiplayer

!> capas

> figuras geometricas

//> hacer custom la eleccion del tamaño de las herramientas

//> exportar dibujos como imgs?

//> agregar una especie de alert cuando vas a darle a clear

> hacer ico en photoshop

> añadir textos

//> fix major bugs with redo and undo buttons
*/

/*********************************************************************
//*                          CANVAS MAIN THING
*********************************************************************/

const mainCanvas = document.getElementById("main-canvas");
const context = mainCanvas.getContext("2d", { willReadFrequently: true });

let initialX;
let initialY;

const dibujar = (cursorX,cursorY,range,current_color = '#000000') =>{
    context.beginPath();
    context.moveTo(initialX, initialY);
    context.lineWidth = range;
    context.strokeStyle = current_color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(cursorX,cursorY);
    context.stroke();

    initialX = cursorX;
    initialY = cursorY;
}


/*********************************************************************
//*                            HERRAMIENTAS
*********************************************************************/

let current_key = "lapiz";
let current_color = "#000";

let undo_count = -1;
let action_array = []; //servira de referencia para los botones undo
let redo_array = []; 
let redo_count = -1;

let preventDelete = 0;

const lapiz = document.getElementById("lapiz");
const lapiz_slider = document.querySelector(".lapiz_slider");
const borrador = document.getElementById("borrador");
const borrador_slider = document.querySelector(".borrador_slider");
const color_selector = document.querySelector(".color_selector");
const saveSettings = document.getElementById("saveSettings");
const spans = document.querySelectorAll(".perfil");
const img = document.querySelectorAll('img[src="trash_png.png"]');
const grosor = document.querySelectorAll(".grosor");
const borrador_number = document.querySelector(".borrador_number");
const lapiz_number = document.querySelector(".lapiz_number");

const undo = document.getElementById("undo");
const redo = document.getElementById("redo");
const clear = document.getElementById("clear");


let slider_L = parseInt(lapiz_slider.value);        //range value para el lapiz
let slider_B = parseInt(borrador_slider.value);     //range value para el borrador

let localStorageGetItem = (indice,dato) => {return localStorage.getItem(indice).split(",")[dato]};
clear.addEventListener("click",()=>{
    popUp('¿Estas seguro de que quieres borrar TODO?',
    'Recuerda, esta accion es irreversible.',
    'warning',
    false,
    true,
    true
    ).then((msg) => {
        if (msg.isDismissed !== true) {
            clearCanvas();
        }
       })//.catch((msg) => {
//         console.log("rejected promise")
//       })
})

function setButtonProperty(boton,indice){
    grosor[indice].style.width = `${(localStorageGetItem(indice,0)/60)}em`
    spans[indice].style.borderRightWidth = `0.5vw`; spans[indice].style.borderStyle = `outset`; spans[indice].style.borderColor = `black`; 
    spans[indice].style.background = localStorageGetItem(indice,1);
    boton.addEventListener("click",()=>{
        try {
            current_color = localStorageGetItem(indice,1);
            color_selector.value = localStorageGetItem(indice,1);
            lapiz_slider.value = localStorageGetItem(indice,0);
            lapiz_number.value = localStorageGetItem(indice,0);
            slider_L = localStorageGetItem(indice,0);
        } catch (error) {}
                                                       //! da error pero funciona igualmente
        
    })
    img[indice].addEventListener("click",()=>{
        localStorage.removeItem(indice);
        boton.style.display = "none";
    })
}

function loadSettings(element,index) {
    if (localStorage.getItem(index) !== null){
        element.style.display = "flex";
        setButtonProperty(element,index);
    }
}

spans.forEach((element, index) => loadSettings(element,index));

saveSettings.addEventListener("click",()=>{               //TODO:
    if (typeof(Storage) !== "undefined") {
        for (let i = 0; i < spans.length; i++) {
            if (spans[i].style.display !== ""){
                spans[i].style.display = "flex";
                if (localStorage.getItem(i) === null){
                    current_color = current_color.length != 7 ? "#000000" : current_color;
                    localStorage.setItem(i,[slider_L,current_color])
                    setButtonProperty(spans[i],i)
                    break;
                }
            } else console.log("invalid");
        }
    } else {
        popUp('Su navegador no soporta esta funcion',
    'Lamentablemente no puede hacer uso de la funcion de guardar lapices, recomiendo usar Chrome',
    'error',
    true,
    false,
    false
    )

    }
})

color_selector.addEventListener("change",(e)=>{          //* tranquilamente puede ir en el DOM
    current_color = e.target.value; 
});

/*********************************************************************
//*                         LAPIZ
*********************************************************************/

function lapizRange(){
    slider_L = parseInt(lapiz_slider.value);
    lapiz_number.value = slider_L;
    return slider_L;
}

lapiz.addEventListener("click",()=>{                     //* tranquilamente puede ir en el DOM
    current_key = "lapiz";
    lastClicked(lapiz);
})

lapiz_slider.addEventListener("mouseup",()=> {  lapizRange();    })

lapiz_number.addEventListener("focusout",()=>{
    lapiz_slider.value = parseInt(lapiz_number.value);
    lapizRange();
})

/*********************************************************************
//*                         GOMA
*********************************************************************/

borrador.addEventListener("click", ()=>{                 //* tranquilamente puede ir en el DOM
    current_key = "borrar";
    lastClicked(borrador);
})

function borradorRange(){
    slider_B = parseInt(borrador_slider.value);
    borrador_number.value = slider_B;
    return slider_B;
}

borrador_slider.addEventListener("mouseup",()=> {   borradorRange();    })

borrador_number.addEventListener("focusout",()=>{
    borrador_slider.value = parseInt(borrador_number.value);
    borradorRange();
})

//
//*
//

function lastClicked(button){
    if(document.getElementsByClassName("clicked")[0] !== undefined){
        document.getElementsByClassName("clicked")[0].classList.remove("clicked");
    };
    button.classList.add("clicked");
}

function clearCanvas(undo_confirm = "clear") {
if(undo_confirm === "clear"){
        redo_count = -1; redo_array = []; redo.innerHTML = `redo (${redo_array.length})`;
        context.clearRect(0,0,mainCanvas.width,mainCanvas.height);
    } else {if (undo_count !== -1 && preventDelete !== 1) {
        redoSimplified("add");
        context.clearRect(0,0,mainCanvas.width,mainCanvas.height);
        preventDelete = 1;
    }}

    action_array = []; undo_count = -1; undo.innerHTML = `undo (${action_array.length})`;
}

function redoSimplified(order) {
    switch (order) {
        case 'add':
            redo_count++;
            redo_array.push(context.getImageData(0,0,mainCanvas.width,mainCanvas.height));
            redo.innerHTML = `redo (${redo_array.length})`;
            break;

        case 'subtract':
            context.putImageData(redo_array[redo_count],0,0);
            redo_count--;
            redo_array.pop();
            redo.innerHTML = `redo (${redo_array.length})`;
            action_array = [];
            undo_count = -1;
            undo.innerHTML = `undo (${action_array.length})`;
            break;
    }
}

undo.addEventListener("click",()=>{

    if (undo_count <= 0){
        clearCanvas("notAnEvent");
    } else {
        redoSimplified('add');
        undo_count--;
        action_array.pop();
        context.putImageData(action_array[undo_count],0,0);   
    }
    undo.innerHTML = `undo (${action_array.length})`;
})

redo.addEventListener("click",()=>{
    redo_count >= 0 ? redoSimplified('subtract') : redo_array = [];
})

document.querySelector(".downloadCanvas").addEventListener("click",()=>{
    downloadArtwork(context.getImageData(0,0,mainCanvas.width,mainCanvas.height))
})

function downloadArtwork(dataimg){      //* Png o Jpg?...
    if(mainCanvas){
        context.putImageData(dataimg,0,0)

        let img = new Image();
        img.src = mainCanvas.toDataURL();

        const downloadInstance = document.createElement('a');
        downloadInstance.href = `${img.src}`;
        downloadInstance.target = '_blank';
        downloadInstance.download = `myArtwork`;

        document.body.appendChild(downloadInstance);
        downloadInstance.click();
        document.body.removeChild(downloadInstance);
    } else {
        popUp('Error',
    'El archivo no pudo descargarse',
    'error',
    true,
    false,
    false
    )
}
}

/*********************************************************************
//*                         Eventos Principales
*********************************************************************/



const mouseDown = (evt) => {
    if (evt.button === 0){      // habilita solo el clic izq.
        initialX = evt.offsetX;
        initialY = evt.offsetY;
        switcher(evt,current_key,current_color);
        mainCanvas.addEventListener('mousemove',mouseMoving);
    }
}

const mouseUp = (evt)=> {
    if (evt.button === 0){ // habilita solo el clic izq.
        preventDelete = 0;
        mainCanvas.removeEventListener('mousemove',mouseMoving);

        evt.preventDefault();
        if (evt.type != 'mouseout'){
            action_array.push(context.getImageData(0,0,mainCanvas.width,mainCanvas.height));
            undo_count++;
            redo_count = -1; redo_array = []; redo.innerHTML = `redo (${redo_array.length})`;
            undo.innerHTML = `undo (${action_array.length})`;
        }
    }
    
}

function mouseMoving(evt) {
    switcher(evt,current_key,current_color); 
}


const switcher = (evt,key,current_color) =>{
    switch (key) {
        case "lapiz":
            dibujar(evt.offsetX, evt.offsetY, slider_L,current_color);
            break;
        case "borrar":
            context.clearRect((evt.offsetX - (slider_B/2)),(evt.offsetY-(slider_B/2)),slider_B,slider_B,slider_B);
            break;
        default:
            break;
    }
    
}

mainCanvas.addEventListener("mousedown",mouseDown);
mainCanvas.addEventListener("mouseup",mouseUp);