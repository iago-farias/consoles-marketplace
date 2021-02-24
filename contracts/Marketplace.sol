pragma solidity >=0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Consoles Marketplace";
        createProduct("PS5", 15);
        createProduct("PS4", 4);
        createProduct("Xbox Series S", 10);
        createProduct("Xbox Series X", 16);
    }

    function createProduct(string memory _name, uint _price) public {
        // Verifica se é um nome válido
        require(bytes(_name).length > 0);

        // Verifica se é um preço válido
        require(_price > 0);

        // Incrementa o contador de produtos do contrato
        productCount ++;

        // Cria o produto
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);

        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        // Busca o produto de acordo com id passado
        Product memory _product = products[_id];

        // Captura o endereço do vendedor
        address payable _seller = _product.owner;

        // Verifica se o id do produto recebido é válido
        require(_product.id > 0 && _product.id <= productCount);

        // Verifica se a transação possui ether suficiente
        require(msg.value >= _product.price);

        // Verifica se o produto não foi comprado
        require(!_product.purchased);

        // Verifica se quem está invocando o contrato não é o vendedor
        require(_seller != msg.sender);

        // Torna o comprador como o dono do produto
        _product.owner = msg.sender;

        _product.purchased = true;

        // Atualiza o produto
        products[_id] = _product;

        // Transfere o ether para o vendedor
        address(_seller).transfer(msg.value);

        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}