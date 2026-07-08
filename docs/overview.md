# Visão Geral

## O que é o Track Your Cash

Track Your Cash é uma API REST para monitoramento de movimentações e transações bancárias. O sistema possui backend e banco de dados próprios, integrando-se à [Pierre Finance](https://www.pierre.finance) como fonte externa de dados bancários.

> O projeto está em desenvolvimento ativo. Algumas funcionalidades ainda estão sendo implementadas.

## Objetivo

Centralizar e persistir dados bancários do usuário — contas e transações — em uma base própria, permitindo consultas, filtros e futuramente análises financeiras personalizadas, independentemente da disponibilidade ou mudanças da API externa.

## O que faz

- Gerencia usuários com autenticação própria (registro e login)
- Armazena e gerencia a chave de acesso do usuário à Pierre Finance API
- Sincroniza contas bancárias a partir da Pierre Finance, persistindo os dados localmente
- Armazena transações bancárias vinculadas às contas sincronizadas
- Expõe operações de CRUD para usuários, contas e transações via HTTP

## Como faz

O fluxo principal de uso é:

1. O usuário se registra e recebe um token JWT
2. O usuário vincula sua chave da Pierre Finance à sua conta
3. O sistema busca as contas na Pierre API, valida a resposta e persiste localmente
4. As transações são então armazenadas vinculadas às contas correspondentes
5. A partir daí, o usuário consulta seus dados diretamente pela API do Track Your Cash

A integração com a Pierre Finance é feita sob demanda (via endpoint de sincronização), não em tempo real. Os dados bancários ficam armazenados na base local e podem ser consultados a qualquer momento sem depender de nova chamada externa.
