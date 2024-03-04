import { isNull } from 'lodash';
import decodeBlobFromURI from '../decodeBlobFromURI';

const tests = [
  {
    params: {
      dataURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxOCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPGcgaWQ9ImRlbGV0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAwKSI+CiAgICA8ZyBpZD0iR3JvdXBfOTcxIiBkYXRhLW5hbWU9Ikdyb3VwIDk3MSI+CiAgICAgIDxwYXRoIGlkPSJQYXRoXzQ5MCIgZGF0YS1uYW1lPSJQYXRoIDQ5MCIgY2xhc3M9ImNscy0xIiBkPSJNNDIuNCwyLjU5SDM4LjY1OFYxLjk4QTEuOTgyLDEuOTgyLDAsMCwwLDM2LjY3OSwwSDMzLjEyMWExLjk4MiwxLjk4MiwwLDAsMC0xLjk3OSwxLjk4VjIuNTlIMjcuNGEuNS41LDAsMCwwLDAsMWguOVYxNS4zMjhBMi42NzUsMi42NzUsMCwwLDAsMzAuOTcyLDE4aDcuODU2YTIuNjc1LDIuNjc1LDAsMCwwLDIuNjctMi42NzJWMy41OWguOWEuNS41LDAsMCwwLDAtMVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNi45KSIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==',
      dataType: 'svg+xml',
    },
    res: {
      typeDescription: 'instance of Blob',
      type: 'Blob',
    },
  },
  {
    params: {
      dataURI: 'abc',
      dataType: 'defg',
    },
    res: {
      typeDescription: 'null',
      type: null,
    },
  },
];

describe('decodeBlobFromURI utility tests set', () => {
  tests.forEach((item) => {
    test(
      `decodeBlobFromURI ran with params: \n\n dataURI: ${item.params.dataURI}, \n\n dataType: ${item.params.dataType} \n\n should return ${item.res.typeDescription}`,
      () => {
        const result = decodeBlobFromURI(...Object.values(item.params));
        if (isNull(item.res.type)) {
          expect(result).toBeNull();
        } else {
          expect(result).toBeInstanceOf(Blob);
        }
      },
    );
  });
});
