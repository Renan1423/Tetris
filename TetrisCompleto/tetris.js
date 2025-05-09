//As cores do fundo e do canvas estão definidas no HTML
//As cores das peças estão definidas na linha 183
//Autor original: Rafael Sakurai
//Adaptado por: Eduardo Gonelli

let tela = []; // matriz com as cores de cada quadrado da tela.
let pontos = 0; // pontuação do jogador.
let canvas; // canvas.
let ctx; // contexto 2d do canvas.
let peca; // tetraminó que está descendo.
let proximaPeca; // próximo tetraminó.
let tempo = 0; // tempo do último movimento do tetramino que está descendo.
let lag = 1000; // intervalo de tempo de movimentação do tetraminó.
let tam; //Tamanho das peças em blocos
//Controle das rotações das peças
let rotBastao = 1;     //1 deitado 2 em pé
let rotZ = 1;          //1 deitado 2 em pé
let rotS = 1;          //1 deitado 2 em pé
let rotL = 1;          //4 posições
let rotLInvertido = 1; //4 posições
let rotT = 1;          //4 posições
const somPontuacao = document.getElementById("SomPontuacao");
const somPeca = document.getElementById("SomPeca");


function iniciarJogo() {
  // Limpa as informações da tela, deixando todos os quadrados em branco.
  for (let l = 0; l < 15; l++) {
    tela[l] = [];
    for (let c = 0; c < 10; c++) {
      tela[l][c] = 'white';
    }
  }
  peca = new Peca(); //instancia um novo tetramino.
  proximaPeca = new Peca(); //instancia um novo tetramino.
  desenharProximaPeca();
  tempo = new Date().getTime(); //Tempo para controla a velocidade de queda dos tetraminós.
}

function carregarTela() {
  // limpa a tela
  ctx.clearRect(0, 0, 500, 750);
  // pinta os quadrados que possuem as partes dos tetraminós na tela.
  for (let l = 0; l < tela.length; l++) {
    for (let c = 0; c < tela[l].length; c++) {
      // se a posição não for branca, desenha o bloco.
      if (tela[l][c] != 'white') {
        if (tela[l][c] instanceof HTMLImageElement) {
          // Draw the image if it's an image element
          ctx.drawImage(tela[l][c], 50 * c, 50 * l, 50, 50);
        }
      }
    }
  }
  // desenha o tetraminó que está descendo.
  desenharPeca();
  // desenha as linhas na horizontal e vertical.
  grids();
}

function desenharPeca() {
  // desenha cada parte do tetraminó na tela.
  for (let i = 0; i < tam; i++) {
    let x = peca.partes[i][1] * 50;
    let y = peca.partes[i][0] * 50;
    ctx.drawImage(peca.bloco, x, y, 50, 50);
  }
}

function desenharProximaPeca() {
  const previewCanvas = document.getElementById("preview");
  const previewCtx = previewCanvas.getContext("2d");

  // Clear the preview canvas
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Draw each part of the next piece
  for (let i = 0; i < proximaPeca.partes.length; i++) {
    let x = (proximaPeca.partes[i][1] - 3) * 50; // Center the piece in the preview
    let y = (proximaPeca.partes[i][0] + 1) * 50; // Adjust position for better visibility
    previewCtx.drawImage(proximaPeca.bloco, x, y, 50, 50);
  }
}

function movimentarPeca() {
  // verifica se o tetraminó pode descer.
  if (podeMover("descer")) {
    peca.descer(); //desce o tetraminó
  } else { //Senão
    // preenche a posição de parada do tetraminó na tela.
    for (let i = 0; i < tam; i++) {
      if (peca.partes[i][0] >= 0 && peca.partes[i][1] >= 0) {
        tela[peca.partes[i][0]][peca.partes[i][1]] = peca.bloco;
      }
    }
    // cria um novo tetraminó.
    peca = proximaPeca;
    proximaPeca = new Peca();
    desenharProximaPeca(); // atualizar a visualização da próxima peça
    somPeca.play();
    // verifica se tem linhas completas.
    verificarLinhasCompletas();

    //Reseta o controle da rotação das peças
    rotBastao = 1;
    rotZ = 1;
    rotS = 1;
    rotLInvertido = 1;
    rotL = 1;
    rotT = 1;
  }
}

//Metodo que testa se pode descer, ir para a esquerda ou direita
function podeMover(novaPos) {
  for (let i = 0; i < tam; i++) {
    switch (novaPos) {
      case "descer":
        //Se chegou ao final ou tem uma peça abaixo, não pode descer
        if (peca.partes[i][0] + 1 > 14 || tela[peca.partes[i][0] + 1][peca.partes[i][1]] != 'white') {
          return false;
        }
        break;
      case "esquerda":
        //Se encostou na lateral esquerda ou tem uma peça na esquerda, não pode ir para a esquerda
        if (peca.partes[i][1] - 1 < 0 || (tela[peca.partes[i][0]][peca.partes[i][1] - 1] != 'white')) {
          return false;
        }
        break;
      //Se encostou na lateral direita ou tem uma peça na direita, não pode ir para a direita        
      case "direita":
        if (peca.partes[i][1] + 1 > 9 || (tela[peca.partes[i][0]][peca.partes[i][1] + 1] != 'white')) {
          return false;
        }
        break;
    }
  }
  return true; //Se não há impedimento, pode mover
}

function verificarLinhasCompletas() {
  let linhas = [];
  // Percorre todas as linhas da tela
  for (let l = 0; l < tela.length; l++) {
    let linhaCompleta = true;
    //Verifica se na linha tem algum bloco em branco.
    for (let c = 0; c < tela[l].length; c++) {
      if (tela[l][c] == 'white') {
        linhaCompleta = false;
      }
    }
    //Se a linha estiver completamente preenchida, guarda o número da linha para depois remover.
    if (linhaCompleta) {
      linhas.push(l);
      somPontuacao.play();
    }
  }
  removerLinhas(linhas); //Solicita a remoção das linhas preenchidas.
}

function removerLinhas(linhas) {
  for (let i = 0; i < linhas.length; i++) {
    // Preenche as linhas que serão removidas com a cor branca.
    for (let c = 0; c < tela[linhas[i]].length; c++) {
      tela[linhas[i]][c] = 'white';
    }
    // De cima para baixo, vai movendo as pedras para a linha que foi removida.
    for (let l = linhas[i] - 1; l >= 0; l--) {
      for (let c = 0; c < tela[l].length; c++) {
        tela[l + 1][c] = tela[l][c];
      }
    }
    pontos++; //Para cada linha removida, aumenta 1 ponto do jogador.
    lag -= 25; //Aumenta a velocidade das peças
  }
  atualizarPontuacao(pontos); //Atualiza na página os pontos do jogador.
}

function atualizarPontuacao(ponto) {
  // Atualiza a pontuação do jogador.
  document.getElementById("pontuacao").innerHTML = "Pontuação: " + ponto;
}

function grids() {
  // Desenha as linhas na horizontal e vertical.
  for (let i = 0; i <= canvas.height; i += 50) {
    //Desenha as linhas verticais
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    //Desenha as linhas horizontais
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function Peca() {
  //Cria a matriz com as peças
  this.pecas = [
    [[-1, 4], [-1, 5], [0, 5], [0, 6]],   //  peça 0 = Z
    [[-1, 4], [-1, 5], [-1, 6], [0, 6]],  //  peça 1 = L invertido
    [[0, 3], [0, 4], [0, 5], [0, 6]],     //  peça 2 = ---- bastao
    [[-1, 5], [-1, 6], [0, 5], [0, 6]],   //  peça 3 = quadrado
    [[-1, 4], [-1, 5], [0, 3], [0, 4]],   //  peça 4 = S
    [[-1, 4], [-1, 5], [-1, 6], [0, 4]],  //  peça 5 = L
    [[-1, 4], [-1, 5], [-1, 6], [0, 5]]]; //  peça 6 =  T

  this.blocos = [
    document.getElementById("Bloco4"),
    document.getElementById("Bloco2"),
    document.getElementById("Bloco3"),
    document.getElementById("Bloco1"),
    document.getElementById("Bloco3"),
    document.getElementById("Bloco4"),
    document.getElementById("Bloco2"),
  ];

  // Seleciona um tetraminó aleatório quando uma instância da peça é criada
  let index = Math.floor(Math.random() * this.pecas.length);
  this.partes = this.pecas[index];
  // Seleciona uma imagem para o tetraminó
  this.bloco = this.blocos[index];

  tam = this.partes.length;
}

//Controla as funções das peças
Peca.prototype = {
  descer: function () {
    // Para descer o tetraminó é preciso incrementar em 1 o valor da linha.
    let mover = podeMover("descer");
    //Incrementa o valor em da linha para cada parte da peça
    //A peça tem n partes, então todas aumentam l + 1
    if (mover) {
      for (let l = 0; l < tam; l++) {
        this.partes[l][0] += 1;
      }
    }
  }, //Fim da função descer

  paraEsquerda: function () {
    //Testa se pode mover para a esquerda
    let mover = podeMover("esquerda");
    //Se for possível mover para a esquerda, então decrementa em 1 o valor da coluna.
    if (mover) {
      for (let c = 0; c < tam; c++) {
        this.partes[c][1] -= 1;
      }
    }
  },

  paraDireita: function () {
    let mover = podeMover("direita");
    //Se for possível mover para a direita, então incrementa em 1 o valor da coluna.
    if (mover) {
      for (let c = 0; c < tam; c++) {
        this.partes[c][1] += 1;
      }
    }
  },

  //funcao de rotacao de peca
  rotacao: function () {
    let mover = podeMover("descer");
    if (mover) {
      let centerX = this.partes[1][0];
      let centerY = this.partes[1][1];

      let novasPartes = this.partes.map(part => {
        let x = part[0] - centerX;
        let y = part[1] - centerY;

        let newX = y;
        let newY = -x;

        return [centerX + newX, centerY + newY];
      });

      let ajusteX = 0;
      let ajusteY = 0;

      for (let i = 0; i < novasPartes.length; i++) {
        let [newRow, newCol] = novasPartes[i];

        // left
        if (newCol < 0) {
          ajusteY = Math.max(ajusteY, -newCol);
        }
        // right
        if (newCol > 9) {
          ajusteY = Math.min(ajusteY, 9 - newCol);
        }
        // bottom
        if (newRow > 14) {
          ajusteX = Math.min(ajusteX, 14 - newRow);
        }
      }

      for (let i = 0; i < novasPartes.length; i++) {
        novasPartes[i][0] += ajusteX;
        novasPartes[i][1] += ajusteY;
      }

      let podeRotacionar = novasPartes.every(part => {
        let [row, col] = part;
        return row >= 0 && row < 15 && col >= 0 && col < 10 && tela[row][col] === 'white';
      });

      if (podeRotacionar) {
        this.partes = novasPartes;
      }
    }
  }
} //fim do protótipo da peça

function animacao() {
  // carrega as informações da tela
  carregarTela();

  if (!terminou()) { // Se não terminou o jogo
    /* Verifica se já passou o tempo minimo, para fazer o tetraminó descer de 1 em 1 segundo. */
    if (new Date().getTime() - tempo > lag) {
      // Se já passou o tempo minimo de espera
      movimentarPeca(); //Movimenta o tetraminó
      tempo = new Date().getTime(); //Guarda o tempo atual
    }
    //Solicita uma nova animação para a próxima vez que renderizar a tela.
    requestAnimationFrame(animacao);
  }
}

function desenhar() {
  //inicia um novo jogo
  iniciarJogo();

  canvas = document.getElementById("area");
  ctx = canvas.getContext("2d");

  //Controla movimentação do tetraminó
  document.addEventListener('keydown', function (e) {
    if (e.key == "ArrowLeft") {
      peca.paraEsquerda();
    } else if (e.key == "ArrowRight") {
      peca.paraDireita();
    }
    if (e.key == "ArrowDown") {
      peca.descer();
    }
    if (e.key == "ArrowUp") {
      peca.rotacao();
    }
    //Reinicia o jogo em caso de GameOver
    if (terminou() && e.code == "Space") {
      window.location.reload();
    }
  });
  requestAnimationFrame(animacao);
}

function terminou() {
  //A verificação se terminou ou não o jogo é feita identificando
  //se já há algum tetraminó ocupando as posições centrais da primeira linha,
  //pois isso impede que novos tetraminós possam descer
  let fim = (tela[0][4] != 'white') || (tela[0][5] != 'white');

  if (fim) {
    // Apresenta uma mensagem informando que o jogo terminou.
    //Desenha um background escuro
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //Fonte do Game Over
    ctx.font = "70px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2);
    //Fonte do Pressione espaço...
    ctx.lineWidth = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "yellow";
    ctx.font = "30px Comic Sans MS";
    let texto = "Pressione espaço para reiniciar!";
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2 + 30);
    ctx.strokeText(texto, canvas.width / 2, canvas.height / 2 + 30);
  }
  return fim;
}

window.addEventListener("load", desenhar);
