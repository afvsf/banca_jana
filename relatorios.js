const express = require('express');
const router = express.Router();

const ExcelJS = require('exceljs');

const PDFDocument = require('pdfkit');

const pool = require('./db');

const auth = require('./middleAuth');


// ======================================
// PDF FINANCEIRO
// ======================================

router.get('/financeiro/pdf', async (req, res) => {

    try {

        const pagamentos =
            await pool.query(`

                SELECT
                    a.nome,
                    m.valor_pago,
                    m.forma_pagamento,
                    m.data_pagamento

                FROM mensalidades m

                INNER JOIN alunos a
                ON a.id = m.aluno_id

                WHERE m.status = 'PAGO'

                ORDER BY m.data_pagamento DESC

            `);

        const doc = new PDFDocument();

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        res.setHeader(
            'Content-Disposition',
            'inline; filename=financeiro.pdf'
        );

        doc.pipe(res);

        doc.fontSize(20)
           .text(
               'Relatório Financeiro',
               {
                   align: 'center'
               }
           );

        doc.moveDown();

        pagamentos.rows.forEach(item => {

            doc
            .fontSize(12)
            .text(`Aluno: ${item.nome}`);

            doc.text(
                `Valor: R$ ${item.valor_pago}`
            );

            doc.text(
                `Pagamento: ${item.forma_pagamento}`
            );

            doc.text(
                `Data: ${item.data_pagamento}`
            );

            doc.moveDown();

        });

        doc.end();

    } catch(error) {

        res.status(500).json(error);

    }

});

router.get('/devedores/pdf', async (req, res) => {

    try {

        const devedores =
            await pool.query(`

                SELECT
                    a.nome,
                    a.responsavel,
                    a.telefone,

                    SUM(m.valor) AS total

                FROM mensalidades m

                INNER JOIN alunos a
                ON a.id = m.aluno_id

                WHERE m.status != 'PAGO'

                GROUP BY
                    a.nome,
                    a.responsavel,
                    a.telefone

            `);

        const doc = new PDFDocument();

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        doc.pipe(res);

        doc.fontSize(20)
           .text(
               'Relatório Devedores',
               {
                   align: 'center'
               }
           );

        doc.moveDown();

        devedores.rows.forEach(item => {

            doc.text(
                `Aluno: ${item.nome}`
            );

            doc.text(
                `Responsável: ${item.responsavel}`
            );

            doc.text(
                `Telefone: ${item.telefone}`
            );

            doc.text(
                `Devido: R$ ${item.total}`
            );

            doc.moveDown();

        });

        doc.end();

    } catch(error) {

        res.status(500).json(error);

    }

});

router.get('/financeiro/excel', async (req, res) => {

    try {

        const pagamentos =
            await pool.query(`

                SELECT
                    a.nome,
                    m.valor_pago,
                    m.forma_pagamento,
                    m.data_pagamento

                FROM mensalidades m

                INNER JOIN alunos a
                ON a.id = m.aluno_id

                WHERE m.status = 'PAGO'

            `);

        const workbook =
            new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet(
                'Financeiro'
            );

        worksheet.columns = [

            {
                header: 'Aluno',
                key: 'nome',
                width: 30
            },

            {
                header: 'Valor',
                key: 'valor_pago',
                width: 15
            },

            {
                header: 'Forma',
                key: 'forma_pagamento',
                width: 20
            },

            {
                header: 'Data',
                key: 'data_pagamento',
                width: 20
            }

        ];

        pagamentos.rows.forEach(item => {

            worksheet.addRow(item);

        });

        res.setHeader(

            'Content-Type',

            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        );

        res.setHeader(

            'Content-Disposition',

            'attachment; filename=financeiro.xlsx'

        );

        await workbook.xlsx.write(res);

        res.end();

    } catch(error) {

        res.status(500).json(error);

    }

});

module.exports = router;
