// Initialize web3
let web3;
let marketplaceContract;
let userAccount;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = web3.eth.accounts[0]; // Corrected to get the first account properly
            console.log('Connected to wallet:', userAccount);
            showToast('Wallet connected successfully!', true);
            initContract();
            loadItems();
        } catch (error) {
            console.error("Could not connect to wallet:", error);
            showToast('Failed to connect to wallet!', false);
        }
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        showToast('Non-Ethereum browser detected. Please use MetaMask!', false);
    }
});

// Function to initialize contract
function initContract() {
    const contractAddress = '0xDF32dcbed4513BAC7E64296cF0f0dD9Ed64cBD68'; // Ensure this is the correct deployed address
    const abi = [

            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "itemId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "seller",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "ItemListed",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "itemId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "ItemPurchased",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_price",
                        "type": "uint256"
                    }
                ],
                "name": "listNewItem",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_itemId",
                        "type": "uint256"
                    }
                ],
                "name": "purchaseItem",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllItems",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address payable",
                                "name": "seller",
                                "type": "address"
                            },
                            {
                                "internalType": "string",
                                "name": "title",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "description",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "price",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bool",
                                "name": "isSold",
                                "type": "bool"
                            }
                        ],
                        "internalType": "struct Marketplace.Item[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "itemCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "items",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "seller",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isSold",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
    ];
    marketplaceContract = new web3.eth.Contract(abi, contractAddress);
    console.log("Contract initialized:", marketplaceContract);
}

// Connect Wallet Button
document.getElementById('connectWallet').addEventListener('click', async () => {
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        console.log('Connected to wallet:', userAccount);
        showToast('Wallet connected successfully!', true);
        loadItems();
    } catch (error) {
        console.error('Could not connect to wallet:', error);
        showToast('Failed to connect to wallet!', false);
    }
});


// Form submission handler
document.getElementById('listItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    
    if (!title || !description || !price || isNaN(price) || parseFloat(price) <= 0) {
        showToast('Please enter a valid price greater than 0 ETH.', false);
        return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        console.log('User Account:', userAccount); // Log user account
        
        await listItem(title, description, price); // Pass price as it is
    } catch (error) {
        console.error('Could not connect to wallet:', error);
        showToast('Failed to connect to wallet!', false);
    }
});



async function listItem(title, description, price) {
    try {
        const ni = await marketplaceContract.methods.listNewItem(title, description, price)
            .send({ from: userAccount }) // Ensure 'from' field is properly set
            .on('receipt', function(receipt) {
                console.log('Item listed:', receipt);
                showToast('Item listed successfully!', true);
                const hash = receipt.transactionHash;
                alert(`Transaction hash: ${hash}`);
                loadItems(); // Reload the items list
            });
    } catch (error) {
        console.error('Error listing item:', error);
        showToast('Failed to list item!', false);
    }
}

async function purchaseItem(itemId, price) {
    try {
        const acc = await ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = acc[0];
        // Ensure userAccount is defined
        if (!userAccount) {
            throw new Error('User account not found. Please connect your wallet.');
        }

        // Call the smart contract function to purchase the item
        const bought=await marketplaceContract.methods.purchaseItem(itemId).send({ from: userAccount, value: price });
        
        // Transaction successful, provide feedback to the user
        showToast('Purchase successful!', true);
        const hash1= bought.transactionHash;
        alert(`Transaction hash: ${hash1}`);
        console.log('Purchase successful');
        loadItems(); // Refresh the items list after purchase
    } catch (error) {
        // Transaction failed, provide error feedback
        console.error('Purchase failed:', error);
        showToast('Purchase failed. Please try again.', false);
    }
}

async function loadItems() {
    const itemsListElement = document.getElementById('itemsList');
    itemsListElement.innerHTML = '';  // Clear the list before loading new items

    try {
        const items = await marketplaceContract.methods.getAllItems().call();
        items.forEach(item => {
            if (!item.isSold) {
                const itemElement = document.createElement('li');
                itemElement.innerHTML = `
                    <strong>${item.title}</strong> - ${web3.utils.fromWei(item.price, 'wei')} Wei<br>
                    <em>${item.description}</em><br>
                    <button onclick="purchaseItem(${item.id}, ${item.price})">Purchase</button><br><br>
                `;
                itemsListElement.appendChild(itemElement);
            }
        });
    } catch (error) {
        console.error('Error loading items:', error);
        showToast('Failed to load items!', false);
    }
}




// Function to display toast notification
function showToast(message, success = true) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.remove('hidden');
  if (success) {
    toast.classList.add('success');
  } else {
    toast.classList.add('error');
  }
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('success');
    toast.classList.remove('error');
  }, 3000); // Hide after 3 seconds
}
