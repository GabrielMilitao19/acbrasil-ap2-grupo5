document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. PRIMEIRA COISA: ACORDA A API DA BOLSA
    // ==========================================
    // Movemos para o topo para garantir que ela rode independente de erros no menu
    carregarDadosBolsa(); 

    // ==========================================
    // 2. LÓGICA DO MENU HAMBÚRGUER (Protegida)
    // ==========================================
    try {
        var menuButton = document.getElementById("menu-button");
        var menu = document.getElementById("menu");

        if (menuButton && menu) {
            menuButton.addEventListener("click", function(e) {
                e.stopPropagation();
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });

            menu.querySelectorAll("a").forEach(function(link) {
                link.addEventListener("click", function() {
                    menu.style.display = "none";
                });
            });

            document.addEventListener("click", function(e) {
                if (!menu.contains(e.target) && e.target !== menuButton) {
                    menu.style.display = "none";
                }
            });
        }
    } catch (err) {
        console.error("Erro na lógica do menu:", err);
    }

    // ==========================================
    // 3. DESTACAR LINK ATIVO (Seguro para GitHub Pages)
    // ==========================================
    try {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(function(link) {
            var hrefAttr = link.getAttribute('href');
            if (hrefAttr) {
                var linkPage = hrefAttr.split('/').pop();
                if (linkPage && linkPage === currentPage) {
                    link.style.color = 'var(--accent-yellow)';
                    link.style.borderBottom = '2px solid var(--accent-yellow)';
                    link.style.paddingBottom = '2px';
                }
            }
        });
    } catch (err) {
        console.error("Erro ao destacar link ativo:", err);
    }
});


// ==========================================
// A FUNÇÃO DA API DA BOLSA
// ==========================================
async function carregarDadosBolsa() {
    const marketDataContainer = document.getElementById('market-data');
    if (!marketDataContainer) return; 

    const minhaChave = '8e58a332';
    const url = `https://api.hgbrasil.com/finance?format=json-cors&key=${minhaChave}`;
    
    try {
        const resposta = await fetch(url);
        
        // Se a HG Brasil bloquear por limite ou erro, joga o código para o catch
        if (!resposta.ok) {
            throw new Error(`HG Brasil retornou status ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        
        // Verifica se a estrutura de dados retornada está correta
        if (!dados || !dados.results) {
            throw new Error("Dados da API vieram inválidos ou vazios.");
        }
        
        const ibovespaDados = dados.results.stocks?.IBOVESPA;
        const nasdaqDados = dados.results.stocks?.NASDAQ;
        const dolarDados = dados.results.currencies?.USD;

        const getCorVariacao = (variacao) => (variacao || 0) >= 0 ? 'text-up' : 'text-down';
        const getSinal = (variacao) => (variacao || 0) > 0 ? '+' : '';
        const getIcone = (variacao) => (variacao || 0) >= 0 ? '▲' : '▼'; 

        const ibovPontos = ibovespaDados && ibovespaDados.points !== null && ibovespaDados.points !== undefined
            ? `${ibovespaDados.points.toLocaleString('pt-BR')} <span style="font-size: 1rem; color: #aaa; font-weight: 500;">pts</span>`
            : 'Fechado';
        const ibovVar = ibovespaDados?.variation ?? 0;

        const nasdaqPontos = nasdaqDados && nasdaqDados.points !== null && nasdaqDados.points !== undefined
            ? `${nasdaqDados.points.toLocaleString('pt-BR')} <span style="font-size: 1rem; color: #aaa; font-weight: 500;">pts</span>`
            : 'Fechado';
        const nasdaqVar = nasdaqDados?.variation ?? 0;

        const dolarValor = dolarDados && dolarDados.buy !== null && dolarDados.buy !== undefined
            ? `<span style="font-size: 1.2rem; color: #aaa; font-weight: 500;">R$</span> ${dolarDados.buy.toFixed(2).replace('.', ',')}`
            : 'Indisponível';
        const dolarVar = dolarDados?.variation ?? 0;

        marketDataContainer.innerHTML = `
            <div class="market-card">
                <div class="market-card-title">Ibovespa <span>🇧🇷</span></div>
                <div class="market-card-value">${ibovPontos}</div>
                <div class="market-card-variation ${getCorVariacao(ibovVar)}">
                    ${getIcone(ibovVar)} ${getSinal(ibovVar)}${ibovVar}%
                </div>
            </div>

            <div class="market-card">
                <div class="market-card-title">NASDAQ <span>🇺🇸</span></div>
                <div class="market-card-value">${nasdaqPontos}</div>
                <div class="market-card-variation ${getCorVariacao(nasdaqVar)}">
                    ${getIcone(nasdaqVar)} ${getSinal(nasdaqVar)}${nasdaqVar}%
                </div>
            </div>

            <div class="market-card">
                <div class="market-card-title">Dólar (Comercial) <span>💵</span></div>
                <div class="market-card-value">${dolarValor}</div>
                <div class="market-card-variation ${getCorVariacao(dolarVar)}">
                    ${getIcone(dolarVar)} ${getSinal(dolarVar)}${dolarVar}%
                </div>
            </div>
        `;
    } catch (erro) {
        console.error("Erro detalhado ao carregar a API da Bolsa:", erro);
        marketDataContainer.innerHTML = `
            <p style="color: #dc2626; text-align: center; width: 100%; font-weight: bold;">Erro ao carregar dados de mercado. Verifique sua conexão ou limite de acessos.</p>
        `;
    }
}