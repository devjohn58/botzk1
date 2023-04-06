const { default: axios } = require("axios");
const express = require("express");
const app = express();
const port = 3000;
const { symbol, name, decimals, totalSupply } = require("./fetchchain");

let start = false;
const listTx = [];
const blacklist = [
	// "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
	// "0x0e97c7a0f8b2c9885c8ac9fc6136e829cbc21d42",
];

async function sendMessage(
	contractToken,
	name_,
	symbol_,
	owner,
	balance,
	supply_,
	decimals_
) {
	const url =
		"https://api.telegram.org/bot6068620438:AAFQ9CTBbfXNb0yR-2hxLBm7CYhvLoSSyw8/sendMessage";
	const data = {
		chat_id: "@zkbotsnewtokens",
		text: `🕵🏻‍♂️  New Token Found  →  ${name_} 
\`${contractToken}\`
👾  Token:     ${name_} (${symbol_})
👩‍💻  Owner:     [Owner's Wallet](https://explorer.zksync.io/address/${owner})
💵  Balance:   ${balance} ETH
🐳  Buy here:  [Buy via Mute](https://app.mute.io/swap")
📈  Chart:     [Dexscreener chart](https://dexscreener.com/zksync/${contractToken})
🥮  Supply:    ${supply_} (+${decimals_} decimals)

    Join us at: `,
		parse_mode: "MarkDown",
		disable_web_page_preview: 1,
	};
	try {
		await axios.post(url, data);
		return;
	} catch (error) {
		console.log(error);
		return;
	}
}

async function func() {
	console.clear();
	const res = await axios(
		"https://zksync2-mainnet-explorer.zksync.io/transactions?limit=50&direction=older&contractAddress=0x8B791913eB07C32779a16750e3868aA8495F5964"
	);
	res.data?.list?.forEach(async (l) => {
		if (l.data.calldata) {
			let isSend = false;
			const owner = l.initiatorAddress;
			const contractToken = "0x" + l.data.calldata.slice(34, 74);
			if (blacklist.includes(contractToken)) {
				return;
			}
			if (l.data.calldata.slice(0, 10) === "0x3a8e53ff") {
				if (!listTx.includes(contractToken)) {
					listTx.push(contractToken);
					isSend = true;
					if (listTx.length > 100) {
						listTx.shift();
					}
					const _symbol = await symbol(contractToken);
					const _name = await name(contractToken);
					const _decimals = await decimals(contractToken);
					const supplyres = await totalSupply(contractToken);
					const _supply = Number(
						supplyres.slice(0, supplyres.length - Number(_decimals))
					).toLocaleString();
					const getBalance = await axios(
						"https://zksync2-mainnet-explorer.zksync.io/address/" +
							owner
					);
					const _balance = (
						parseInt(
							getBalance.data?.info?.balances[
								"0x0000000000000000000000000000000000000000"
							]?.balance ?? 0
						) /
						10 ** 18
					).toFixed(4);
					console.log(_balance);
					if (isSend) {
						await sendMessage(
							contractToken,
							_name,
							_symbol,
							owner,
							_balance,
							_supply,
							_decimals
						);
						isSend = false;
					}
				}
			}
		}
	});
	console.log(listTx.length);
	console.log(listTx);
	console.log("==============================================");
	setTimeout(() => {
		func();
	}, 1000);
}

app.listen(port, function (error) {
	if (error) {
		console.log("Something went wrong");
	}
	func();
});
