const express = require('express');
const router = express.Router();

const PDFDocument = require('pdfkit');

const pool = require('../database/db');


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

module.exports = router;
