document.addEventListener('DOMContentLoaded', function () {

    var form = document.getElementById('form-fidelidade');
    var campoCpf = document.getElementById('cpf-fidelidade');
    var erroCpf = document.getElementById('cpf-erro');
    var resultado = document.getElementById('resultado-fidelidade');

    if (!form || !campoCpf || !resultado) return;

    /* ---------- Máscara do CPF (000.000.000-00) ---------- */
    campoCpf.addEventListener('input', function () {
        var numeros = campoCpf.value.replace(/\D/g, '').slice(0, 11);
        var formatado = numeros;

        if (numeros.length > 9) {
            formatado = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        } else if (numeros.length > 6) {
            formatado = numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (numeros.length > 3) {
            formatado = numeros.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }

        campoCpf.value = formatado;
        esconderErro();
    });

    /* ---------- Validação básica do CPF (dígitos verificadores) ---------- */
    function cpfValido(cpf) {
        var numeros = cpf.replace(/\D/g, '');
        if (numeros.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(numeros)) return false; // rejeita 000.000.000-00, 111.111.111-11, etc.

        var soma = 0, resto;

        for (var i = 1; i <= 9; i++) {
            soma += parseInt(numeros.substring(i - 1, i), 10) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros.substring(9, 10), 10)) return false;

        soma = 0;
        for (i = 1; i <= 10; i++) {
            soma += parseInt(numeros.substring(i - 1, i), 10) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros.substring(10, 11), 10)) return false;

        return true;
    }

    function mostrarErro() {
        campoCpf.classList.add('campo-invalido');
        campoCpf.setAttribute('aria-invalid', 'true');
        if (erroCpf) erroCpf.hidden = false;
    }

    function esconderErro() {
        campoCpf.classList.remove('campo-invalido');
        campoCpf.removeAttribute('aria-invalid');
        if (erroCpf) erroCpf.hidden = true;
    }

    /* ---------- Envio do formulário ---------- */
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var cpf = campoCpf.value;

        if (!cpfValido(cpf)) {
            mostrarErro();
            resultado.hidden = true;
            resultado.classList.remove('visivel');
            return;
        }

        esconderErro();
        buscarFidelidade(cpf);
    });

    /* ================================================================
       BONIFICAÇÕES — edite os textos abaixo diretamente aqui no código.
       Isso NÃO vem da planilha: a planilha só informa o nome, a
       designação (Cliente/Decoradora) e o número de festas realizadas.
       O texto de bonificação exibido é sempre o que estiver definido
       nesta lista, de acordo com o número de festas.

       "minFestas" = a partir de quantas festas esse prêmio vale.
       Deixe "texto" vazio ('') se não quiser mostrar nada nesse nível
       (o cartão vai mostrar a última bonificação desbloqueada).
       ================================================================ */
    var BONIFICACOES = {
        cliente: [
            { minFestas: 1, texto: '' },
            { minFestas: 2, texto: '' },
            { minFestas: 3, texto: 'Defina aqui o prêmio para 3 festas' }
        ],
        decoradora: [
            { minFestas: 1, texto: '' },
            { minFestas: 2, texto: '' },
            { minFestas: 3, texto: 'Defina aqui o prêmio para 3 festas' },
            { minFestas: 4, texto: '' },
            { minFestas: 5, texto: '' },
            { minFestas: 6, texto: 'Defina aqui o prêmio para 6 festas' }
        ]
    };

    function obterBonificacao(tipo, festas) {
        var lista = BONIFICACOES[tipo] || [];
        var texto = '';
        for (var i = 0; i < lista.length; i++) {
            if (festas >= lista[i].minFestas && lista[i].texto) {
                texto = lista[i].texto;
            }
        }
        return texto || 'Continue participando para desbloquear bonificações!';
    }

    /* Busca um valor no objeto retornado pela planilha, tentando
       algumas variações de nome de coluna (maiúsculas, acentos etc.) */
    function obterCampo(dados, nomesPossiveis) {
        var chaves = Object.keys(dados);
        for (var i = 0; i < nomesPossiveis.length; i++) {
            for (var j = 0; j < chaves.length; j++) {
                if (chaves[j].toLowerCase() === nomesPossiveis[i].toLowerCase()) {
                    return dados[chaves[j]];
                }
            }
        }
        return '';
    }

    /* ---------- Busca do status de fidelidade ----------
       Troque a URL abaixo pela URL gerada ao implantar o
       Code.gs como "App da Web" no Google Apps Script.
       Exemplo: https://script.google.com/macros/s/AKfycbx.../exec */
    var URL_API = 'https://script.google.com/macros/s/AKfycbwM-ZRyltuypTzbTDqbmHQpfARly3VPjvCDYEg32BBFcblKy6NyD5nodoeEIw3bSH2-mg/exec';

    function buscarFidelidade(cpf) {
        var cpfLimpo = cpf.replace(/\D/g, '');

        resultado.hidden = false;
        mostrarMensagem('Consultando...');
        requestAnimationFrame(function () {
            resultado.classList.add('visivel');
        });

        if (!URL_API || URL_API.indexOf('COLOQUE_AQUI') === 0) {
            mostrarMensagem('A consulta ainda não está conectada à planilha.');
            return;
        }

        fetch(URL_API + '?cpf=' + encodeURIComponent(cpfLimpo))
            .then(function (resposta) { return resposta.json(); })
            .then(function (dados) {
                exibirResultado(dados);
            })
            .catch(function () {
                mostrarMensagem('Não foi possível consultar agora. Tente novamente.');
            });
    }

    function mostrarMensagem(texto) {
        resultado.innerHTML = '<div class="resultado-mensagem-caixa">' + texto + '</div>';
    }

    function exibirResultado(dados) {
        if (dados.erro) {
            mostrarMensagem(dados.erro);
            return;
        }

        if (!dados.encontrado) {
            mostrarMensagem('CPF não encontrado em nosso programa de fidelidade.');
            return;
        }

        var nome = obterCampo(dados, ['Nome']) || 'Cliente';
        var designacaoTexto = obterCampo(dados, ['Designação', 'Designacao']) || 'Cliente';
        var festas = parseInt(obterCampo(dados, ['Festas']), 10) || 0;

        var tipo = designacaoTexto.toLowerCase().indexOf('decoradora') !== -1 ? 'decoradora' : 'cliente';
        var totalBolinhas = tipo === 'decoradora' ? 6 : 3;

        var bolinhasHtml = '';
        for (var i = 1; i <= totalBolinhas; i++) {
            var ativa = i <= festas;
            bolinhasHtml += '<div class="bolinha ' + (ativa ? 'bolinha-ativa' : 'bolinha-inativa') + '">' + i + '</div>';
        }

        var bonificacao = obterBonificacao(tipo, festas);

        resultado.innerHTML =
            '<div class="cartao-fidelidade">' +
                '<div class="cartao-cabecalho">' +
                    '<p class="cartao-nome">' + nome + '</p>' +
                    '<p class="cartao-designacao">Designação - ' + designacaoTexto + '</p>' +
                '</div>' +
                '<div class="cartao-festas-label">Festas realizadas</div>' +
                '<div class="cartao-bolinhas">' + bolinhasHtml + '</div>' +
                '<div class="cartao-bonificacao">' + bonificacao + '</div>' +
            '</div>';
    }
});
