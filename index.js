const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const { symbol, name, decimals, totalSupply } = require("./fetchchain");
const { default: axios } = require("axios");

const blacklist = [
	"0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
	"0x0e97c7a0f8b2c9885c8ac9fc6136e829cbc21d42",
	"0x90eea899185105d583d04b7bdbfb672fce902a53",
	"0xc8ec5b0627c794de0e4ea5d97ad9a556b361d243",
	"0x81d60e05c805c27ad5cdb63948c3c7027d3acfb9",
	"0xbfb4b5616044eded03e5b1ad75141f0d9cb1499b",
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

🙆‍♂  Join us:    @zkDetector
☎️  Contact us: @davezonk | @maynardkane`,
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

async function getpair() {
	const res = await axios(
		"https://zksync2-mainnet-explorer.zksync.io/transactions?limit=30&direction=older&contractAddress=0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D"
	);
	res.data?.list?.forEach(async (l) => {
		const arraydata = l?.data?.calldata.slice(0, 138);
		const arr = [
			arraydata.slice(0, 10),
			arraydata.slice(98, 138),
			arraydata.slice(34, 74),
		];
		if (arr?.[0] === "0xb2e916d6") {
			const data = fs.readFileSync("./list.json", "utf8");
			const dataStr = JSON.parse(data)?.list;
			const dataArr = dataStr?.split(",");

			let isSend = false;
			const owner = l.initiatorAddress;
			const contractToken =
				arr?.[1] === "5aea5775959fbc2557cc8789bc1bf90a239d9a91"
					? "0x" + arr[2]
					: "0x" + arr[1];
			if (blacklist.includes(contractToken)) {
				return;
			}
			if (!dataArr.includes(contractToken)) {
				//handle to list
				dataArr.push(contractToken);
				isSend = true;
				if (dataArr.length > 100) {
					dataArr.shift();
				}
				const datawrite = JSON.stringify(
					{ list: dataArr.join(",") },
					null,
					4
				);
				fs.writeFileSync("./list.json", datawrite, "utf8");

				// get info token
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

				//send message to telegram
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
	});
}

async function getaddlp() {
	const res = await axios(
		"https://zksync2-mainnet-explorer.zksync.io/transactions?limit=50&direction=older&contractAddress=0x8B791913eB07C32779a16750e3868aA8495F5964"
	);
	res.data?.list?.forEach(async (l) => {
		if (l.data.calldata) {
			const data = fs.readFileSync("./list.json", "utf8");
			const dataStr = JSON.parse(data)?.list;
			const dataArr = dataStr?.split(",");

			let isSend = false;
			const owner = l.initiatorAddress;
			const contractToken = "0x" + l.data.calldata.slice(34, 74);
			if (blacklist.includes(contractToken)) {
				return;
			}
			if (l.data.calldata.slice(0, 10) === "0x3a8e53ff") {
				if (!dataArr.includes(contractToken)) {
					//handle to list
					dataArr.push(contractToken);
					isSend = true;
					if (dataArr.length > 100) {
						dataArr.shift();
					}
					const datawrite = JSON.stringify(
						{ list: dataArr.join(",") },
						null,
						4
					);
					fs.writeFileSync("./list.json", datawrite, "utf8");

					// get info token
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
}

async function func() {
	console.clear();
	try {
		await getpair();
		await getaddlp();
		console.log("==============================================");
		const data = fs.readFileSync("./list.json", "utf8");
		const dataStr = JSON.parse(data)?.list;
		const dataArr = dataStr?.split(",");
		console.log(dataArr.length);
		console.log("==============================================");
		setTimeout(() => {
			func();
		}, 3000);
	} catch (error) {
		setTimeout(() => {
			func();
		}, 10000);
	}
}
app.listen(port, function (error) {
	if (error) {
		console.log("Something went wrong");
	}
	func();
});
