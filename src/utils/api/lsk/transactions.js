import Lisk from '@liskhq/lisk-client';
import { getAPIClient } from './network';
import { getTimestampFromFirstBlock } from '../../datetime';
import { toRawLsk } from '../../lsk';
import txFilters from '../../../constants/transactionFilters';

// TODO remove this function as is replaced right now by Create and Broadcast functions
// Issue ticket #2046
export const send = (
  amount,
  data,
  networkConfig,
  passphrase,
  recipientId,
  secondPassphrase = null,
  timeOffset,
) =>
  new Promise((resolve, reject) => {
    const txId = Lisk.transaction.transfer({
      amount,
      data,
      passphrase,
      recipientId,
      secondPassphrase,
      timeOffset,
    });

    getAPIClient(networkConfig).transactions.broadcast(txId)
      .then(resolve(txId))
      .catch(reject);
  });

const parseTxFilters = (filter = txFilters.all, address) => ({
  [txFilters.incoming]: { recipientId: address },
  [txFilters.outgoing]: { senderId: address },
  [txFilters.all]: { senderIdOrRecipientId: address },
}[filter]);

const processParam = (filters, filtersKey, paramsKey, transformFn) => ({
  ...(filters[filtersKey] && filters[filtersKey] !== '' ? {
    [paramsKey]: transformFn(filters[filtersKey]),
  } : {}),
});

const parseCustomFilters = filters => ({
  ...processParam(filters, 'message', 'data', value => `%${value}%`),
  ...processParam(filters, 'dateFrom', 'fromTimestamp', (value) => {
    const fromTimestamp = getTimestampFromFirstBlock(value, 'DD.MM.YY');
    return fromTimestamp > 0 ? fromTimestamp : 0;
  }),
  ...processParam(filters, 'dateTo', 'toTimestamp', (value) => {
    const toTimestamp = getTimestampFromFirstBlock(value, 'DD.MM.YY', { inclusive: true });
    return toTimestamp > 1 ? toTimestamp : 1;
  }),
  ...processParam(filters, 'amountFrom', 'minAmount', toRawLsk),
  ...processParam(filters, 'amountTo', 'maxAmount', toRawLsk),
});

export const getTransactions = ({
  networkConfig, liskAPIClient, address, limit = 20, offset = 0, type = undefined,
  sort = 'timestamp:desc', filters = {}, transformResponse = x => x,
}) => {
  let params = {
    limit,
    offset,
    sort,
    ...parseCustomFilters(filters),
    ...(type !== undefined ? { type } : {}),
  };

  if (address) {
    params = {
      ...params,
      ...parseTxFilters(filters.direction, address),
    };
  }

  return new Promise((resolve, reject) => {
    (liskAPIClient || getAPIClient(networkConfig)).transactions.get(params).then(response => (
      resolve(transformResponse(response))
    )).catch(reject);
  });
};

export const getSingleTransaction = ({
  networkConfig, id, liskAPIClient,
}) => new Promise((resolve, reject) => {
  // TODO remove liskAPIClient after all code that uses is is removed
  const apiClient = liskAPIClient || getAPIClient(networkConfig);
  apiClient.transactions.get({ id })
    .then((response) => {
      if (response.data.length !== 0) {
        resolve(response);
      } else {
        apiClient.node.getTransactions('ready', { id }).then((unconfirmedRes) => {
          if (unconfirmedRes.data.length !== 0) {
            resolve(unconfirmedRes);
          } else {
            reject(new Error(`Transaction with id "${id}" not found`));
          }
        }).catch(reject);
      }
    }).catch(reject);
});

export const create = (transaction, transactionType) => new Promise((resolve, reject) => {
  try {
    const tx = Lisk.transaction[transactionType](transaction);
    resolve(tx);
  } catch (error) {
    reject(error);
  }
});

export const broadcast = (transaction, networkConfig) => new Promise(async (resolve, reject) => {
  try {
    await getAPIClient(networkConfig).transactions.broadcast(transaction);
    resolve(transaction);
  } catch (error) {
    reject(error);
  }
});
