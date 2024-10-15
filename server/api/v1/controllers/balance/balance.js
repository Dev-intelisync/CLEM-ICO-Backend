import { walletServices } from '../../services/wallet';
const { updateWallet, walletList } = walletServices;

const cronJob = require("cron").CronJob;

let JobMain = new cronJob('*/59 * * * * *', async function () {
    try {
        const walletData = await walletList({  })

    } catch (error) {
        console.log("error", error);
    }

})
JobMain.start();
