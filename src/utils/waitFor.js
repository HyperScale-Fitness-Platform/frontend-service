// Polls a condition until it returns a truthy value or the timeout elapses.
// Resolves with the condition's result (or false on timeout/error).
export function waitFor(
    condition,
    {
        timeout = 15000,
        interval = 600
    } = {}
) {

    return new Promise((resolve) => {

        const start = Date.now();

        const check = async () => {

            let result;

            try {

                result = await condition();

            }
            catch {

                result = false;

            }

            if (result) {

                resolve(result);

                return;

            }

            if (Date.now() - start >= timeout) {

                resolve(false);

                return;

            }

            setTimeout(check, interval);

        };

        check();

    });

}