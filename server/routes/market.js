const express = require('express');
const { NotFoundError, ValidationError } = require('../errors');

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

  function findWatchlist(id) {
    const watchlist = watchlists.find((candidate) => candidate.id === id);
    if (!watchlist) throw new NotFoundError(`Watchlist ${id} was not found.`);
    return watchlist;
  }

  router.post('/watchlists/:id/companies', (req, res) => {
    const watchlist = findWatchlist(req.params.id);
    const companyId = req.body?.companyId;
    if (!companyId) throw new ValidationError('Choose a company.', 'companyId');
    const company = findCompany(companyId);
    if (watchlist.companyIds.includes(company.id)) {
      throw new ValidationError(`${company.name} is already in ${watchlist.name}.`, 'companyId');
    }
    watchlist.companyIds.push(company.id);
    res.status(201).json({ watchlist: expand(watchlist) });
  });

  router.delete('/watchlists/:id/companies/:companyId', (req, res) => {
    const watchlist = findWatchlist(req.params.id);
    const index = watchlist.companyIds.indexOf(req.params.companyId);
    if (index === -1) {
      throw new NotFoundError(`Company ${req.params.companyId} is not in ${watchlist.name}.`);
    }
    watchlist.companyIds.splice(index, 1);
    res.json({ watchlist: expand(watchlist) });
  });

  return router;
}

module.exports = { marketRouter };
