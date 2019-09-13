import { Particle, Meta, MetaAdditions } from "@euglena/core";
import { js } from "cessnalib";

export const vacuole = com(
  "Vacuole",,
  addReaction => {
    let _particles: Particle[] = [];

    addReaction("VacuoleSap", async (sap, { cp }) => {
      _particles = sap.data;
      return cp.ACK();
    });

    addReaction("ReadParticle", async (particle, { cp }) => {
      const { query, count } = particle.data;
      const retVal: Particle[] = [];
      for (let i = 0, len = 0; i < _particles.length && (count === "all" || len < count); i++) {
        if (js.Class.doesMongoCover(_particles[i], query)) {
          retVal.push(_particles[i]);
          len++;
        }
      }
      return cp.Particles(retVal);
    });
    addReaction("SaveParticle", async (particle, { cp }) => {
      const { query, count } = particle.data;
      const overridedParticles: Meta[] = [];
      if (query) {
        let overrideCount = 0;
        for (let i = 0; i < _particles.length && (count === "all" || overrideCount < count); i++) {
          if (js.Class.doesMongoCover(_particles[i], query)) {
            overridedParticles.push(_particles[i].meta);
            _particles[i] = particle;
            overrideCount++;
          }
        }
      } else {
        _particles.push(particle);
      }
      return cp.Metas(overridedParticles);
    });
    addReaction("RemoveParticle", async (particle, { cp }) => {
      const { query, count } = particle.data;
      const removedParticles: Meta[] = [];
      if (query) {
        let removeCount = 0;
        for (let i = 0; i < _particles.length && (count === "all" || removeCount < count); i++) {
          if (js.Class.doesMongoCover(_particles[i], query)) {
            const removed = _particles.splice(i--, 1)[0];
            removedParticles.push(removed.meta);
            removeCount++;
          }
        }
      }
      return cp.Metas(removedParticles);
    });
  }
);
