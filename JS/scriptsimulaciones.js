document.addEventListener(
'DOMContentLoaded',
()=>{

const btn=
document.getElementById(
'btn-simulaciones'
);


const heroContent=
document.querySelector(
'.hero-content'
);


const hero=
document.querySelector(
'.hero'
);



btn.addEventListener(
'click',
async(e)=>{

e.preventDefault();


try{

const respuesta=
await fetch(
'http://localhost:5000/api/simulaciones'
);


const datos=
await respuesta.json();



if(
!document.getElementById(
'css-simulaciones'
)
){

const css=
document.createElement(
'link'
);

css.id=
'css-simulaciones';

css.rel=
'stylesheet';

css.href=
datos.cssUrl;


document.head
.appendChild(css);

}



hero.classList.remove(
'modo-sobrenosotros'
);


hero.classList.add(
'modo-simulaciones'
);


heroContent.innerHTML=
datos.html;


heroContent.style.width=
'100%';

heroContent.style.background=
'transparent';

heroContent.style.border=
'none';

heroContent.style.backdropFilter=
'none';


}
catch(error){

console.log(error);

}

});

});

/*==================================================
FUNCIÓN GLOBAL REQUERIDA PARA CARGAR EL JUEGO
==================================================*/
window.irASimulacion = async (event, urlEndpoint) => {
    if (event) event.preventDefault();
    
    const heroContent = document.querySelector('.hero-content');
    
    try {
        const respuesta = await fetch(`http://localhost:5000${urlEndpoint}`);
        const datos = await respuesta.json();
        
        // Inyecta el iframe de forma estándar en el espacio de trabajo actual
        heroContent.innerHTML = datos.html;
        heroContent.style.width = '100%';
        heroContent.style.background = 'transparent';
        
    } catch (error) {
        console.error("Error al cargar la simulación incrustada:", error);
    }
};
