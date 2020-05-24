import {QueryFile, IQueryFileOptions} from 'pg-promise';
import getConfig from 'next/config'
const { serverRuntimeConfig } = getConfig()

const path = require('path');

export const books = {
    find: sql('books/find.sql'),
    page: sql('books/page.sql')
};

function sql(file: string): QueryFile {

    const fullPath: string = path.join(serverRuntimeConfig.PROJECT_ROOT, '/db/sql/', file);

    const options: IQueryFileOptions = {
        minify: true,
        noWarnings: true
    };

    const qf: QueryFile = new QueryFile(fullPath, options);

    if (qf.error) {
        console.error(qf.error);
    }

    return qf;
}