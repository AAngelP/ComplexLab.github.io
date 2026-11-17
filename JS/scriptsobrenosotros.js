document.addEventListener(
'DOMContentLoaded',
()=>{

const btnSobreNosotros=
Array.from(
document.querySelectorAll(
'.nav-links a'
))
.find(
el=>
el.textContent.trim()==='Sobre Nosotros'
);


const heroContent=
document.querySelector(
'.hero-content'
);

const heroSection=
document.querySelector(
'.hero'
);



if(
btnSobreNosotros &&
heroContent &&
heroSection
){

btnSobreNosotros.addEventListener(
'click',
async(e)=>{

e.preventDefault();

try{


const respuesta=
await fetch(
'https://onrender.com'
);


const datos=
await respuesta.json();


console.log(datos);

console.log(datos.html);


if(
!document.getElementById(
'css-sobrenosotros'
)
){

const linkCSS=
document.createElement(
'link'
);

linkCSS.id=
'css-sobrenosotros';

linkCSS.rel=
'stylesheet';

linkCSS.href=
datos.cssUrl;

document.head.appendChild(
linkCSS
);

}


heroContent.innerHTML='';


heroContent.style.background=
'transparent';

heroContent.style.border=
'none';

heroContent.style.backdropFilter=
'none';

heroContent.style.width='100%';


heroSection.classList.remove(
'modo-simulaciones'
);


heroSection.classList.add(
'modo-sobrenosotros'
);


if(datos.html){

heroContent.innerHTML=
datos.html;

}
else{

heroContent.innerHTML=`

<h2 style="
color:white;
text-align:center;
">

Error:
la API devolvió
HTML vacío

</h2>

`;

}


}
catch(error){

console.log(error);


heroContent.innerHTML=`

<h2 style="
color:white;
text-align:center;
">

Error al conectar

</h2>

`;

}

});

}

});
