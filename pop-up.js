"use strict";

//funcion auto-convocada. Se ejecuta automaticamente
// ( ()=>{
// 
// })()
function popUp(title,text,icon,confirm,deny,cancel){
    return new Promise (function(resolve){
        resolve(
            Swal.fire({ //await
            title,
            text,
            icon,
            customClass: {
                container: 'pop-up',
            },
            // width: 75%,
            // padding: 1rem,
            // grow: row/column/fullscreen;
            backdrop: true,

            // toast:true,
            // position:'bottom-end'

            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            stopKeydownPropagation: false,

            showConfirmButton: confirm,
            showDenyButton: deny,
            showCancelButton: cancel,
            denyButtonText: `Borrar`,
            cancelButtonText: `Cancelar`,
        }))
});
}

export default popUp;