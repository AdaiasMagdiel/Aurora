const express = require("express");
const Crawler = require("crawler");
const bodyParser = require('body-parser');


/*    EXPRESS    */
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static("public"));


/*    CONSTANTES DE CONFIGURAÇÃO    */
const PORT = process.env.PORT || 3000;
const SITE = "https://www.superanimes.site/";



/****************************** PÁGINA INICIAL ************************************/

app.get("/", function(req, res) {
	var animes = [];
    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".postHomeVideo").each(function(i, e){
                	const nome = $(this).find('a').attr('title');
                	const imagem = $(this).find('.HomeVideoImg img').attr('src');

                	const url = $(this).find('.HomeVideoImg a').attr('href').split("/").slice(3);
                    const tipo = url[0], anime = url[1], episodio = url[2];

                	animes.push({ nome, imagem, tipo, anime, episodio });
                });
            }
            done();
            res.render("index", {animes});
        }
    });

    c.queue(SITE+"ultimos-adicionados");
});

/****************************** ASSISTIR EPISÓDIO *********************************/

app.get("/assistir/:tipo/:nome/:episodio", function(req, res) {
	const URL = req.params.tipo+"/"+req.params.nome+"/"+req.params.episodio;
    var episodio = req.params.episodio.split("-");
    var videoURL = "";
    const infoURL = req.params.tipo+"/"+req.params.nome+"/1";

    const titulo = "Episódio "+episodio[1];
    const proximoEP = req.params.tipo+"/"+req.params.nome+"/"+episodio[0]+"-"+(parseInt(episodio[1])+1);
    const anteriorEP = req.params.tipo+"/"+req.params.nome+"/"+episodio[0]+"-"+(parseInt(episodio[1])-1);
    const voltar = req.params.tipo+"/"+req.params.nome+"/1";

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;
                videoURL = $("#urlVideo").attr("src");
            }
            done();
            res.render("assistir", {videoURL, proximoEP, anteriorEP, voltar, titulo, infoURL});
        }
    });

    c.queue(SITE+URL);
});

/****************************** PESQUISAR ANIME ***********************************/

app.post("/pesquisa", function(req, res) {
	var animePesquisado = req.body.nomeAnime;
		animePesquisado = animePesquisado.split(" ").join("+");

	const animes = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;
                $(".boxLista2").each(function(e, i){
                	const nome = $(this).find(".boxLista2Img a").attr("title");
                	const imagem = $(this).find(".boxLista2Img img").attr("src");
                	const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                	animes.push({nome, imagem, url});
                });
            }
            done();
            res.render("pesquisa", {animes});
        }
    });

    c.queue(SITE+"busca?parametro="+animePesquisado);
});

/****************************** INFO DO ANIME *************************************/

app.get("/:tipo/:nome/:pagina", function(req, res) {
    const URL = req.params.tipo+"/"+req.params.nome+"?pagina="+req.params.pagina;
	const URL_EJS = req.params.tipo+"/"+req.params.nome;
	const episodios = [];
    const paginas = [];
	var info = "";

    const filmes = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                const imagem = $(".boxAnimeImg img").attr('src');
                const nome = $(".boxBarraInfo h1").text().trim();
                const ano = $(".boxAnimeSobreLinha span[itemprop='copyrightYear']").text().trim();
                const episodiosQNTD = $(".boxAnimeSobreLinha span[itemprop='numberofEpisodes']").text().trim();
                const genero = $(".boxAnimeSobreLinha span[itemprop='genre']").text().trim().split(" , ").join(", ");
                const sinopse = $("#sinopse2").text().trim().split(" ( Ocultar )").join("") || $("#sinopse").text().trim();

                $(".epsBox").each(function(e, i){
                	const nome = $(this).find(".epsBoxSobre h3").text().trim();
                	const url = $(this).find(".epsBoxSobre a").attr('href').split("/").slice(3).join('/');

                    episodios.push({nome, url});
                });

                $(".epsBoxFilme").each(function(i, e){
                    const nomeFilme = $(this).find(".linha:first-child h3").text().trim();
                    const urlFilme = $(this).find(".linha:last-child a").attr('href').split("/").slice(3).join('/');
                    filmes.push({nome: nomeFilme, url: urlFilme})
                });

                if($(".selectBoxPaginacao").length){
                    $('.pageSelect option').each(function(e, i){
                        const paginasQNTD = $(this).attr('value');
                        paginas.push(paginasQNTD.replace("Página ", ""));
                    });
                }

                info = {imagem, nome, ano, sinopse, episodiosQNTD, genero};
            }
            done();
            res.render("info", {info, episodios, filmes, paginas, URL_EJS});
        }
    });

    c.queue(SITE+URL);
});

/****************************** TODOS *********************************************/

app.get("/todos/:page", function(req, res) {
    const page = req.params.page;
    var animes = [];
    var paginas = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });

                $(".pageSelect option").each(function(e, i){
                    paginas.push(i+1);
                });
            }
            done();
            res.render("pages/todos", {animes, paginas, page});
        }
    });

    c.queue(SITE+"lista?pagina="+page);
});

/****************************** ANIMES (ALL) **************************************/

app.get("/animes/:page", function(req, res) {
    const page = req.params.page;
    var animes = [];
    var paginas = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });

                $(".pageSelect option").each(function(e, i){
                    paginas.push(i+1);
                });
            }
            done();
            res.render("pages/animes", {animes, paginas, page});
        }
    });

    c.queue(SITE+"anime?pagina="+page);
});

/****************************** CARTOONS (ALL) ************************************/

app.get("/cartoons/:page", function(req, res) {
    const page = req.params.page;
    var animes = [];
    var paginas = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });

                $(".pageSelect option").each(function(e, i){
                    paginas.push(i+1);
                });
            }
            done();
            res.render("pages/cartoons", {animes, paginas, page});
        }
    });

    c.queue(SITE+"cartoon?pagina="+page);
});

/****************************** LIVE-ACTIONS (ALL) ********************************/

app.get("/live-actions/:page", function(req, res) {
    const page = req.params.page;
    var animes = [];
    var paginas = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });

                $(".pageSelect option").each(function(e, i){
                    paginas.push(i+1);
                });
            }
            done();
            res.render("pages/live-actions", {animes, paginas, page});
        }
    });

    c.queue(SITE+"live-action?pagina="+page);
});

/****************************** LANÇAMENTOS ************************************/

app.get("/lancamentos/:page", function(req, res) {
    const page = req.params.page;
    var animes = [];
    var paginas = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });

                $(".pageSelect option").each(function(e, i){
                    paginas.push(i+1);
                });
            }
            done();
            res.render("pages/lancamentos", {animes, paginas, page});
        }
    });

    c.queue(SITE+"lancamento?pagina="+page);
});

/****************************** RECOMENDAÇÕES ************************************/

app.get("/recomendacao", function(req, res) {
    var animes = [];

    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, response, done) {
            if(error){
                console.log(error);
            }
            else{
                const $ = response.$;

                $(".boxLista2").each(function(e, i){
                    const nome = $(this).find(".boxLista2Img a").attr("title");
                    const imagem = $(this).find(".boxLista2Img img").attr("src");
                    const url = $(this).find(".boxLista2Img a").attr("href").split("/").slice(3).join("/");

                    animes.push({nome, imagem, url});
                });
            }
            done();
            res.render("pages/recomendacao", {animes});
        }
    });

    c.queue(SITE+"indicacao");
});

/***************************************************************************/



/*    SERVIDOR    */
app.listen(PORT, function(err) {
    const msg = err ? err : "Servidor rodando na porta " + PORT + "...";
    console.log(msg);
});