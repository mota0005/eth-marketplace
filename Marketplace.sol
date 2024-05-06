// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint256 id;
        address payable seller;
        string title;
        string description;
        uint256 price;
        bool isSold;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    event ItemListed(
        uint256 indexed itemId,
        address indexed seller,
        string title,
        uint256 price
    );

    event ItemPurchased(
        uint256 indexed itemId,
        address indexed buyer,
        uint256 price
    );

    function listNewItem(string memory _title, string memory _description, uint256 _price) public {
        itemCount++;
        items[itemCount] = Item(itemCount, payable(msg.sender), _title, _description, _price, false);

        emit ItemListed(itemCount, msg.sender, _title, _price);
    }

    function purchaseItem(uint256 _itemId) public payable {
        Item storage item = items[_itemId];
        require(msg.sender != item.seller, "Seller cannot buy their own item");
        require(!item.isSold, "Item already sold");
        require(msg.value == item.price, "Please submit the asking price in order to complete the purchase");

        item.seller.transfer(msg.value);
        item.isSold = true;

        emit ItemPurchased(_itemId, msg.sender, item.price);
    }

    // Function to retrieve all items
    function getAllItems() public view returns (Item[] memory) {
        Item[] memory itemList = new Item[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            itemList[i - 1] = items[i];
        }
        return itemList;
    }
}
