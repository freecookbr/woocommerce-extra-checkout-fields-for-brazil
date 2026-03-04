=== Brazilian Market on WooCommerce ===
Tags: woocommerce, checkout, brazil, cpf, cnpj, autofill, consulta cnpj
Requires at least: 4.0
Tested up to: 6.4
Stable tag: 4.1.0
Requires PHP: 5.6
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Adds Brazilian checkout fields in WooCommerce with automatic CNPJ lookup and address autofill.

== Description ==

Adiciona novos campos para Pessoa Física ou Jurídica, Data de Nascimento, Gênero, Número, Bairro e Celular. Além de máscaras em campos e aviso de e-mail incorreto.

= Consulta e Preenchimento Automático de CNPJ =

Este plugin conta com integração com a API pública [CNPJ.ws](https://cnpj.ws) para consulta automática de dados empresariais diretamente no checkout.

Ao preencher o campo **CNPJ** e avançar para o próximo campo, o plugin realiza automaticamente uma consulta à API e preenche os seguintes campos do checkout sem necessidade de nenhum clique adicional:

* **Razão Social** → Empresa
* **Logradouro** (tipo + nome) → Endereço
* **Número** → Número
* **Complemento** → Complemento
* **Bairro** → Bairro
* **CEP** → CEP
* **Cidade** → Cidade
* **Estado** → Estado
* **Telefone** (DDD + número) → Telefone
* **E-mail** → E-mail
* **Inscrição Estadual** (ativa) → Inscrição Estadual

Os dados consultados são cacheados por 1 hora para evitar consultas repetidas à API. A consulta é feita de forma segura pelo servidor WordPress (proxy PHP), portanto o navegador do cliente nunca acessa a API diretamente — sem problemas de CORS ou exposição de credenciais.

= Campos Brasileiros Extras =

Adiciona novos campos para Pessoa Física ou Jurídica, Data de Nascimento, Gênero, Número, Bairro e Celular. Além de máscaras em campos e aviso de e-mail incorreto.

É necessário estar utilizando uma versão do [WooCommerce](http://wordpress.org/extend/plugins/woocommerce/) para que o Brazilian Market on WooCommerce funcione.

= Créditos =

Plugin original criado por [Claudio Sanches](https://claudiosanches.com).

== Upgrade Notice ==

= 4.1.0 =

- Adicionada consulta e preenchimento automático de dados de CNPJ no checkout via API pública CNPJ.ws.

= 4.0.0 =

- Adicionada nova opção para estilo dos campos, agora por padrão com largura total para prevenir incompatibilidade com temas e plugins.
- Melhorada a opção para campo de celular, podendo agora substituir o campo de telefone.
- Separado os campos de Data de Nascimento e Gênero em campos próprios.
- Atualizado sufixo `_sex` para `_gender` no banco de dados.
- Corrigido bug que deixava o campo de Nome da Empresa sempre opcional.
