Array.prototype.random = function(){
    return this[Math.floor(Math.random()*this.length)];
}

$(document).ready(function(){
	setTimeout(function(){
        $('.loading').fadeOut();
    }, 2500);
	$('.sidenav').sidenav();

	if($(".img-here img").attr('src') == ""){
		possibilidades = ["anime", "cartoon", "china", "tokusatsu", "live-action"];
		genero = location.pathname.split("/")[1];

		recarregar();
	}
	else{
		localStorage.removeItem("sorteado");
	}

	$('#voltarAnime').click(function(e){
		e.preventDefault();
		const newURL = location.pathname.split("/").slice(2, -1).concat("1").join("/");
		location.href = "/"+newURL;
	});
});

function recarregar(){
	let Index = Number(localStorage.getItem("sorteado"));
	const escolhido = possibilidades[Index];
	console.log(escolhido);
	console.log(Index);
	if(escolhido == genero){
		Index++;
		localStorage.setItem("sorteado", Index);
		recarregar();
	}
	else{
		window.location.replace(location.pathname.replace(genero, escolhido));
	}
}

function sortear(array){
	return array.random();
}