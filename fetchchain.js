const ABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

const Web3 = require("web3");
const initial = function (contractAddress) {
	const web3 = new Web3("https://mainnet.era.zksync.io");
	const contract = new web3.eth.Contract(ABI, contractAddress);
	return { web3, contract };
};

module.exports.name = async function (contractAddress) {
	const { contract } = initial(contractAddress);
	try {
		const name = await contract.methods.name().call();
		return name;
	} catch (error) {
		return false;
	}
};

module.exports.symbol = async function (contractAddress) {
	const { contract } = initial(contractAddress);
	try {
		const symbol = await contract.methods.symbol().call();
		return symbol;
	} catch (error) {
		return false;
	}
};

module.exports.decimals = async function (contractAddress) {
	const { contract } = initial(contractAddress);
	try {
		const symbol = await contract.methods.decimals().call();
		return symbol;
	} catch (error) {
		return false;
	}
};

module.exports.totalSupply = async function (contractAddress) {
	const { contract } = initial(contractAddress);
	try {
		const symbol = await contract.methods.totalSupply().call();
		return symbol;
	} catch (error) {
		return false;
	}
};
