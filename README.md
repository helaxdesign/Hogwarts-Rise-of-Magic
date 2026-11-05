# Hogwarts: Rise of Magic

Site para RPG de Hogwarts, pensado primeiro para celulares. Ele tem:

1. **Salão Principal** (página inicial): uma estante de bronze com quatro ampulhetas, uma por casa, cada uma com seu brasão. A areia desce conforme os pontos aprovados. Há também um formulário de solicitação de pontos (nome, ano, casa, adicionar/retirar, quantidade e print da cena).
2. **Treinos de Perícias**: formulário com contador de caracteres e limite de 2 treinos por personagem por dia.
   | Tipo | Caracteres mínimos | Ganho |
   |---|---|---|
   | Normal | 1.500 | 20 PP |
   | Talento | 750 | 25 PP |
   | Inaptidão | 3.000 | 15 PP |
3. **Painel da Staff**: login, solicitações pendentes com o print (toque para ampliar), aprovar (os pontos são aplicados sozinhos) ou negar, histórico, leitura das cenas de treino e ajuste manual de pontos.

## Arquivos

```
index.html       estrutura da página
css/style.css    visual (dourado, pergaminho, animações)
js/config.js     configuração: Firebase, limite diário, regras das perícias
js/houses.js     casas, brasões e ampulhetas (SVG)
js/store.js      armazenamento (Firebase na nuvem, ou local)
js/app.js        lógica das páginas
firestore.rules  regras de segurança do banco na nuvem
```

## Publicar (GitHub Pages)

No GitHub, vá em Settings → Pages → *Deploy from a branch*, escolha a branch `main` e a pasta `/ (root)`. O site fica em `https://<usuario>.github.io/<repositorio>/`.

## ☁️ Salvar na nuvem (placar igual em todos os aparelhos)

Sem configuração, o site roda em **Modo local** (aparece uma etiqueta no topo): cada aparelho guarda seus próprios dados e a staff não recebe os pedidos.

Com o **Firebase** (gratuito), tudo fica salvo na nuvem:
- os pontos aprovados aparecem **na hora** em todos os celulares e computadores, sem precisar recarregar;
- os pedidos e treinos chegam para a staff, de qualquer aparelho;
- só quem faz login como staff consegue aprovar pedidos ou mudar pontos, e isso é garantido pelo servidor.

### Passo a passo (uns 10 minutos)

1. **Criar o projeto:** acesse <https://console.firebase.google.com>, clique em *Adicionar projeto*, dê um nome (ex.: `rise-of-magic`) e conclua. O Google Analytics pode ficar desativado.
2. **Criar o banco:** no menu, *Criação → Firestore Database → Criar banco de dados*. Escolha a localização `southamerica-east1 (São Paulo)` e o **modo de produção**.
3. **Regras de segurança:** ainda no Firestore, abra a aba **Regras**, apague o que estiver lá, cole todo o conteúdo do arquivo [`firestore.rules`](firestore.rules) deste repositório e clique em **Publicar**.
4. **Ativar o login da staff:** no menu, *Criação → Authentication → Vamos começar → E-mail/senha → Ativar → Salvar*.
5. **Criar a conta da staff:** em *Authentication → Usuários → Adicionar usuário*:
   - E-mail: `staff-dobby@staff.riseofmagic.app`
   - Senha: a senha combinada para a staff. Não escreva a senha neste repositório, porque ele é público.

   No site, a staff continua entrando com o nickname **Staff Dobby** e essa senha. O e-mail é só interno e não recebe mensagens.
   Para outra pessoa da staff, crie mais um usuário seguindo o mesmo padrão: o nickname em minúsculas, com hífens no lugar dos espaços, + `@staff.riseofmagic.app`. Exemplo: "Prof Snape" vira `prof-snape@staff.riseofmagic.app`.
6. **Registrar o site:** clique na engrenagem ⚙️ → *Configurações do projeto* → em *Seus apps*, clique no ícone **`</>`** (Web), dê um apelido e registre. Vai aparecer um bloco `const firebaseConfig = { ... }`.
7. **Colar a configuração:** copie o que está entre as chaves e cole em `js/config.js`, no lugar de `firebase: null`. Fica assim, com os seus valores:

   ```js
   firebase: {
     apiKey: "...",
     authDomain: "rise-of-magic.firebaseapp.com",
     projectId: "rise-of-magic",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   },
   ```

   Esses valores só identificam o projeto e podem ficar públicos. Quem protege os dados são as regras do passo 3 e o login da staff.
8. Envie a alteração para o GitHub. Quando a etiqueta "Modo local" sumir do topo, o site está salvando na nuvem.

Os prints são comprimidos e guardados no próprio Firestore, então não é preciso ativar o Storage. O plano gratuito do Firebase cobre com folga um grupo de RPG.

Se aparecer **"Sem conexão"** no topo, o site não conseguiu falar com o Firebase. Confira a configuração colada no passo 7.

### Trocar a senha da staff

- **Com Firebase:** em *Authentication → Usuários*, clique nos ⋮ do usuário → *Redefinir senha*, ou exclua o usuário e crie de novo.
- **Modo local:** gere um novo hash de `nickname-em-minúsculas|senha` e substitua `STAFF_HASH` em `js/app.js`:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('staff dobby|NovaSenha').digest('hex'))"
```
