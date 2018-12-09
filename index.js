const express = require("express");
const Crawler = require("crawler");
const bodyParser = require('body-parser');


/*    EXPRESS    */
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


/*    CONSTANTES DE CONFIGURAÇÃO    */
const PORT = process.env.PORT || 3000;
const SITE = "https://www.superanimes.site/";


/*    INÍCIO    */
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


/*    ASSISTIR EPISÓDIO    */
app.get("/assistir/:tipo/:nome/:episodio", function(req, res) {
	const URL = req.params.tipo+"/"+req.params.nome+"/"+req.params.episodio;
	var videoURL = "";
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
            res.render("assistir", {videoURL});
        }
    });

    c.queue(SITE+URL);
});


/*    PESQUISAR ANIME    */
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


/*    INFO DO ANIME    */
app.get("/:tipo/:nome/:pagina", function(req, res) {
    const URL = req.params.tipo+"/"+req.params.nome+"?pagina="+req.params.pagina;
	const URL_EJS = req.params.tipo+"/"+req.params.nome;
	const episodios = [];
    const paginas = [];
	var info = "";

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
                const sinopse = $("#sinopse2").text().trim() || $("#sinopse").text().trim();
                
                $(".epsBox").each(function(e, i){
                	const nome = $(this).find(".epsBoxSobre h3").text().trim();
                	const url = $(this).find(".epsBoxSobre a").attr('href').split("/").slice(3).join('/');

                    episodios.push({nome, url});
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
            res.render("info", {info, episodios, paginas, URL_EJS});
        }
    });

    c.queue(SITE+URL);
});


/*    SERVIDOR    */
app.listen(PORT, function(err) {
    const msg = err ? err : "Servidor rodando na porta " + PORT + "...";
    console.log(msg);
});