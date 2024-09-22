// Número fixo da agência
const NUMERO_AGENCIA = '1234';

// Funções de navegação entre telas
function navigateToMenu() {
    document.getElementById("welcomeScreen").classList.add("hidden");
    document.getElementById("menuScreen").classList.remove("hidden");
}

function navigateTo(screenId) {
    // Lista de todas as telas disponíveis
    const screens = [
      "welcomeScreen", 
      "menuScreen", 
      "cadastroCliente", 
      "abrirConta", 
      "realizarDeposito", 
      "realizarSaque", 
      "extrato", 
      "realizarPix", // Certifique-se de que 'realizarPix' está listado corretamente
      "encerrarConta" // Adicionando 'encerrarConta' aqui
    ];
    
    // Ocultar todas as telas
    screens.forEach((screen) => {
      const element = document.getElementById(screen);
      if (element) {
        element.classList.add("hidden");
      }
    });
  
    // Exibir a tela correspondente ao screenId
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove("hidden");
    } else {
      console.error(`Erro: Tela com id "${screenId}" não encontrada.`);
    }
  }
  

// Função de persistência com LocalStorage
function salvarDados() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('contas', JSON.stringify(contas));
}

function carregarDados() {
    const clientesLocal = localStorage.getItem('clientes');
    const contasLocal = localStorage.getItem('contas');
    if (clientesLocal && contasLocal) {
        clientes = JSON.parse(clientesLocal);
        contas = JSON.parse(contasLocal);
    }
}

let clientes = [];
let contas = [];

// Carregar dados ao iniciar
carregarDados();

// Função de alerta personalizado usando SweetAlert2
function showAlert(titulo, texto, icone) {
    Swal.fire({
        title: titulo,
        html: texto,
        icon: icone,
        confirmButtonText: 'OK',
        confirmButtonColor: '#8A51FC',
        background: '#f7f7f7',
        width: '600px',
        customClass: {
            popup: 'border-2 border-purple-500',
            title: 'text-purple-600 font-bold',
        }
    });
}

// Função para formatar valores em Reais (R$)
function formatarValorBR(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para converter e validar valores monetários corretamente
function converterValor(valor) {
    let valorConvertido = valor.replace(',', '.');
    let valorNumerico = parseFloat(valorConvertido);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        return null; 
    }

    return valorNumerico; 
}

// Cadastrar Cliente
function cadastrarCliente(event) {
    event.preventDefault();
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const endereco = document.getElementById("endereco").value;

    // Verifica se o CPF já está cadastrado
    const clienteExistente = clientes.find((c) => c.cpf === cpf);
    if (clienteExistente) {
        showAlert('Erro!', 'Já existe um cliente cadastrado com este CPF.', 'error');
        return;
    }

    if (!nome || !cpf || !endereco) {
        showAlert('Erro!', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    clientes.push({ nome, cpf, endereco, contas: [] });
    salvarDados();
    showAlert('Sucesso!', 'Cliente cadastrado com sucesso!', 'success');
    document.getElementById("cadastroClienteForm").reset();
    navigateTo("menuScreen");
}

// Abrir Conta com número de agência fixo e número de conta aleatório
function abrirConta(event) {
    event.preventDefault();
    const cpf = document.getElementById("cpfConta").value;

    // Busca o cliente pelo CPF
    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente) {
        showAlert('Erro!', 'Cliente não encontrado!', 'error');
        return;
    }

    // Verifica se o cliente já possui uma conta
    if (cliente.contas.length > 0) {
        showAlert('Erro!', 'Este cliente já possui uma conta.', 'error');
        return;
    }

    const numeroConta = Math.floor(100000 + Math.random() * 900000);  // Número aleatório de 6 dígitos

    const novaConta = {
        numero: numeroConta,
        agencia: NUMERO_AGENCIA,  // Certifique-se de que a agência é atribuída
        saldo: 0,
        cliente: cliente.nome,
        transacoes: []
    };
    
    cliente.contas.push(novaConta);
    contas.push(novaConta);
    salvarDados();
    showAlert('Sucesso!', `Conta criada com sucesso! Agência: ${NUMERO_AGENCIA} | Conta: ${numeroConta}`, 'success');

    document.getElementById("abrirContaForm").reset();
    navigateTo("menuScreen");
}


// Realizar Depósito
function realizarDeposito(event) {
    event.preventDefault();
    const cpf = document.getElementById("cpfDeposito").value;
    let valor = document.getElementById("valorDeposito").value;
    let valorNumerico = converterValor(valor);

    if (valorNumerico === null) {
        showAlert('Erro!', 'Por favor, insira um valor válido para depósito.', 'error');
        return;
    }

    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente || cliente.contas.length === 0) {
        showAlert('Erro!', 'Cliente não encontrado ou não possui conta!', 'error');
        return;
    }

    cliente.contas[0].saldo += valorNumerico;

    cliente.contas[0].transacoes.push({
        tipo: 'Depósito',
        valor: valorNumerico,
        data: new Date().toLocaleString('pt-BR')
    });

    salvarDados();
    showAlert('Depósito realizado!', `Depósito de ${formatarValorBR(valorNumerico)} realizado com sucesso!`, 'success');

    document.getElementById("depositoForm").reset();
    navigateTo("menuScreen");
}

// Realizar Saque
function realizarSaque(event) {
    event.preventDefault();
    const cpf = document.getElementById("cpfSaque").value;
    let valor = document.getElementById("valorSaque").value;
    let valorNumerico = converterValor(valor);

    if (valorNumerico === null) {
        showAlert('Erro!', 'Por favor, insira um valor válido para saque.', 'error');
        return;
    }

    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente || cliente.contas.length === 0) {
        showAlert('Erro!', 'Cliente não encontrado ou não possui conta!', 'error');
        return;
    }

    if (cliente.contas[0].saldo >= valorNumerico) {
        cliente.contas[0].saldo -= valorNumerico;

        cliente.contas[0].transacoes.push({
            tipo: 'Saque',
            valor: valorNumerico,
            data: new Date().toLocaleString('pt-BR')
        });

        salvarDados();
        showAlert('Saque realizado!', `Saque de ${formatarValorBR(valorNumerico)} realizado com sucesso!`, 'success');
    } else {
        showAlert('Erro!', 'Saldo insuficiente!', 'error');
    }

    document.getElementById("saqueForm").reset();
    navigateTo("menuScreen");
}

// Ver Extrato Detalhado com Agência e Número da Conta
function verExtrato(event) {
    event.preventDefault();
    const cpf = document.getElementById("cpfExtrato").value;

    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente || cliente.contas.length === 0) {
        showAlert('Erro!', 'Cliente não encontrado ou não possui conta!', 'error');
        return;
    }

    const conta = cliente.contas[0];  
    const transacoes = conta.transacoes;

    let extratoTransacoes = `
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
                <tr style="background-color: #f3f3f3; border-bottom: 2px solid #8A51FC;">
                    <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ccc;">Tipo</th>
                    <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ccc;">Data e Hora</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ccc;">Valor</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (transacoes.length === 0) {
        extratoTransacoes += `
            <tr>
                <td colspan="3" style="text-align: center; padding: 10px;">Nenhuma transação realizada.</td>
            </tr>
        `;
    } else {
        transacoes.forEach(transacao => {
            extratoTransacoes += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${transacao.tipo}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                        <span style="white-space: nowrap;">
                            ${transacao.data}
                        </span>
                    </td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">
                        ${formatarValorBR(transacao.valor)}
                    </td>
                </tr>
            `;
        });
    }

    extratoTransacoes += `
        </tbody>
    </table>
    `;

    const comprovanteHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; font-size: 12px; text-align: left;">
            <h2 style="text-align: center; color: #8A51FC; margin-bottom: 20px;">Extrato Detalhado</h2>
            <div style="margin-bottom: 20px;">
                <strong>Nome do Cliente:</strong> ${cliente.nome} <br/>
                <strong>CPF:</strong> ${cliente.cpf} <br/>
                <strong>Agência:</strong> ${conta.agencia} <br/>
                <strong>Conta:</strong> ${conta.numero} <br/>
                <strong>Saldo Atual:</strong> ${formatarValorBR(conta.saldo)}
            </div>
            <div style="margin-bottom: 20px;">
                <h2 style="text-align: center; color: #8A51FC; margin-bottom: 20px;">Transações Recentes</h2>
                ${extratoTransacoes}
            </div>
        </div>
    `;

    showAlert('Banco JRBank', comprovanteHTML, 'info');
}


// Função para Encerrar Conta
function encerrarConta(event) {
    event.preventDefault();
    const cpf = document.getElementById("cpfEncerrar").value; // CPF que será inserido pelo usuário

    const cliente = clientes.find((c) => c.cpf === cpf);
    if (!cliente || cliente.contas.length === 0) {
        showAlert('Erro!', 'Cliente não encontrado ou não possui conta!', 'error');
        return;
    }

    // Confirmação antes de encerrar a conta
    Swal.fire({
        title: 'Tem certeza?',
        text: `Deseja realmente encerrar a conta de ${cliente.nome}? Isso removerá todos os dados!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, encerrar!',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remover o cliente e as contas associadas
            clientes = clientes.filter((c) => c.cpf !== cpf);
            contas = contas.filter((conta) => conta.cliente !== cliente.nome);

            salvarDados(); // Persistir alterações no LocalStorage

            // Mostrar mensagem de sucesso
            showAlert('Sucesso!', `A conta de ${cliente.nome} foi encerrada com sucesso!`, 'success');

            // Limpar o formulário e voltar ao menu
            document.getElementById("encerrarContaForm").reset();
            navigateTo("menuScreen");
        }
    });
}



      // Função genérica para navegação entre telas
      function navigateTo(screenId) {
        const screens = ["welcomeScreen", "menuScreen", "cadastroCliente", "abrirConta", "realizarDeposito", "realizarSaque", "extrato", "encerrarConta"];
        
        screens.forEach((screen) => {
          document.getElementById(screen).classList.add("hidden");
        });

        document.getElementById(screenId).classList.remove("hidden");
      }


      // Função para realizar um PIX
function realizarPix(event) {
    event.preventDefault(); // Evitar recarregamento da página
  
    // Capturar os dados do formulário
    const cpfRemetente = document.getElementById('cpfRemetente').value;
    const chavePix = document.getElementById('chavePix').value;
    const valorPix = parseFloat(document.getElementById('valorPix').value); // Converte para número
  
    // Verificar se os campos foram preenchidos corretamente
    if (!cpfRemetente || !chavePix || isNaN(valorPix) || valorPix <= 0) {
      showAlert('Erro!', 'Por favor, preencha todos os campos corretamente.', 'error');
      return;
    }
  
    // Buscar o cliente remetente pelo CPF
    const clienteRemetente = clientes.find(c => c.cpf === cpfRemetente);
    if (!clienteRemetente || clienteRemetente.contas.length === 0) {
      showAlert('Erro!', 'Remetente não encontrado ou não possui conta.', 'error');
      return;
    }
  
    // Verificar saldo da conta do remetente
    const contaRemetente = clienteRemetente.contas[0]; // Assumindo que o cliente só tem uma conta
    if (valorPix > contaRemetente.saldo) {
      showAlert('Erro!', `Saldo insuficiente. Saldo atual: R$ ${contaRemetente.saldo.toFixed(2)}`, 'error');
      return;
    }
  
    // Deduzir o valor do saldo
    contaRemetente.saldo -= valorPix;
  
    // Registrar a transação no extrato da conta do remetente
    contaRemetente.transacoes.push({
      tipo: 'PIX',
      chavePix: chavePix,
      valor: valorPix,
      data: new Date().toLocaleString('pt-BR')
    });
  
    // Salvar os dados atualizados
    salvarDados();
  
    // Exibir mensagem de sucesso
    Swal.fire({
      icon: 'success',
      title: 'PIX realizado!',
      text: `O valor de R$ ${valorPix.toFixed(2)} foi transferido de ${cpfRemetente} para a chave ${chavePix} com sucesso!`,
      confirmButtonText: 'OK'
    }).then(() => {
      // Navegar de volta ao menu principal
      navigateTo('menuScreen');
    });
  }
  
  // Função que adiciona a transação ao extrato
  function adicionarTransacao(tipo, cpfRemetente, chavePix, valorPix) {
    const dataHora = new Date().toLocaleString(); // Pega a data e hora atual
  
    // Registro da transação no console ou em uma lista
    console.log(`Transação: ${tipo}, Remetente: ${cpfRemetente}, Chave Destinatário: ${chavePix}, Valor: R$ ${valorPix}, Data: ${dataHora}`);
  
    // Exibir no extrato (exemplo de exibição na interface)
    const listaExtrato = document.getElementById('listaExtrato'); // Certifique-se de ter essa lista no HTML
    if (listaExtrato) {
      const itemTransacao = document.createElement('li');
      itemTransacao.textContent = `Data: ${dataHora}, Tipo: ${tipo}, De: ${cpfRemetente}, Para: ${chavePix}, Valor: R$ ${valorPix.toFixed(2)}`;
      listaExtrato.appendChild(itemTransacao);
    }
  }
  
  // Salvar dados no LocalStorage
  function salvarDados() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('contas', JSON.stringify(contas));
  }
  
  // Carregar dados do LocalStorage
  function carregarDados() {
    const clientesLocal = localStorage.getItem('clientes');
    const contasLocal = localStorage.getItem('contas');
    if (clientesLocal && contasLocal) {
      clientes = JSON.parse(clientesLocal);
      contas = JSON.parse(contasLocal);
    }
  }
  
  // Carregar os dados ao iniciar
  carregarDados();
  