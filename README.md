# Hogwarts: Rise of Magic

Site para RPG de Hogwarts, pensado primeiro para celulares. Ele tem:

1. **Carta de admissão**: o envelope chega "voando", a pessoa toca no selo de cera, o envelope se abre e a carta se desdobra.
2. **Salão Principal**: quatro ampulhetas douradas, uma por casa, cada uma com seu brasão. A areia desce conforme os pontos aprovados. Há também um formulário de solicitação de pontos (nome, ano, casa, adicionar/retirar, quantidade e print da cena).
3. **Treinos de Perícias**: formulário com contador de caracteres e limite de 2 treinos por personagem por dia.
   | Tipo | Caracteres mínimos | Ganho |
   |---|---|---|
   | Normal | 1.500 | 20 PP |
   | Talento | 750 | 25 PP |
   | Inaptidão | 3.000 | 15 PP |
4. **Painel da Staff**: login, solicitações pendentes com o print (toque para ampliar), aprovar (os pontos são aplicados sozinhos) ou negar, histórico, leitura das cenas de treino e ajuste manual de pontos.

## Arquivos

```
index.html      estrutura da página
css/style.css   visual (dourado, pergaminho, animações)
js/config.js    configuração: Firebase, limite diário, regras das perícias
js/houses.js    casas, brasões e ampulhetas (SVG)
js/store.js     armazenamento (Firebase ou local)
js/app.js       lógica das páginas
```

## Publicar (GitHub Pages)

No GitHub, vá em Settings → Pages → *Deploy from a branch*, escolha a branch e a pasta `/ (root)`. O site fica em `https://<usuario>.github.io/<repositorio>/`.

## ⚠️ Importante: banco de dados compartilhado

Sem configuração, o site roda em **Modo local** (aparece uma etiqueta no topo). Nesse modo, os pedidos, pontos e treinos ficam salvos **só no navegador de quem usa**. Isso serve para testar, mas a staff **não** vê os pedidos dos jogadores.

Para todos compartilharem os mesmos dados, use o Firebase (o plano gratuito basta):

1. Crie um projeto em <https://console.firebase.google.com>.
2. Em *Build → Firestore Database*, crie o banco.
3. Em *Configurações do projeto → Seus apps*, adicione um app **Web** e copie o objeto `firebaseConfig`.
4. Cole esse objeto em `js/config.js`, no campo `firebase:`.

Os prints são comprimidos e salvos dentro do próprio Firestore, então não é preciso configurar o Storage.

### Sobre a segurança

O site é estático, então o login da staff é verificado no navegador. A senha não fica escrita no código (só um hash SHA-256), mas alguém com conhecimento técnico ainda poderia contornar a tela de login ou gravar direto no banco. Para um RPG entre amigos isso costuma bastar. Para uma proteção de verdade, o próximo passo é usar o **Firebase Authentication** para a staff e criar regras no Firestore que só deixam contas da staff aprovar pedidos e alterar pontos.

Para trocar o nickname ou a senha da staff, gere um novo hash de `nickname-em-minúsculas|senha` e substitua `STAFF_HASH` em `js/app.js`:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('staff dobby|NovaSenha').digest('hex'))"
```
