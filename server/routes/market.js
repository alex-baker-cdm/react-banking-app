const express = require('express');
const { NotFoundError } = require('../errors');

function marketRouter({ indices, companies, watchlists, ratingActions }) {
  const router = express.Router();

  function findCompany(id) {
    const company = companies.find((candidate) => candidate.id === id);
    if (!company) throw new NotFoundError(`Company ${id} was not found.`);
    return company;
  }

  function expand(watchlist) {
    return {
      id: watchlist.id,
      name: watchlist.name,
      companies: watchlist.companyIds.map((id) => companies.find((company) => company.id === id)),
    };
  }

  router.get('/indices', (req, res) => {
    res.json({ indices });
  });

  router.get('/companies', (req, res) => {
    res.json({ companies });
  });

  router.get('/companies/:id', (req, res) => {
    res.json({ company: findCompany(req.params.id) });
  });

  router.get('/companies/:id/rating-actions', (req, res) => {
    const company = findCompany(req.params.id);
    res.json({ ratingActions: ratingActions.filter((item) => item.companyId === company.id) });
  });

  router.get('/watchlists', (req, res) => {
    res.json({ watchlists: watchlists.map(expand) });
  });

  return router;
}

module.exports = { marketRouter };
