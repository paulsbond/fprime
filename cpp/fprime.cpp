#include <emscripten/bind.h>
#include "fprime.hpp"

using namespace emscripten;

struct Fprime
{
    double fp;
    double fpp;
};

Fprime fprime(int z, double energy)
{
    double fpp;
    double fp = gemmi::cromer_liberman(z, energy, &fpp);
    return {fp, fpp};
}

std::vector<Fprime> fprimes(int z, std::vector<double> energies)
{
    const int npts = energies.size();
    double fp[npts];
    double fpp[npts];
    gemmi::cromer_liberman_for_array(z, npts, &energies[0], fp, fpp);
    std::vector<Fprime> output;
    for (int i = 0; i < npts; i++)
    {
        output.push_back({fp[i], fpp[i]});
    }
    return output;
}

EMSCRIPTEN_BINDINGS(module)
{
    value_object<Fprime>("Fprime")
        .field("fp", &Fprime::fp)
        .field("fpp", &Fprime::fpp);
    function("fprime", &fprime);
    function("fprimes", &fprimes);
    register_vector<double>("VectorDouble");
    register_vector<Fprime>("VectorFprime");
}
