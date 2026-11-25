# Contribuir al sitio web de QuICC

El sitio web está desarrollado con Astro y se publica automáticamente mediante GitHub Pages.

La mayor parte del contenido puede modificarse directamente desde la interfaz web de GitHub, sin necesidad de instalar nada localmente.

---

# Modificar noticias (News / Blog)

Las entradas del blog se encuentran en:

[`src/content/blog/`](https://github.com/guido-b/quicc-website/tree/main/src/content/blog)

Cada entrada está contenida en un archivo `*.mdx`

Para editar/crear una entrada:
1. Abrir/crear el archivo `*.mdx`
2. Hacer click en ✏️ **Edit**
3. Modificar el contenido
4. Presionar **Commit changes**

El sitio se actualizará automáticamente luego de algunos minutos.

Al crear una entrada nueva, utilizar la siguiente plantilla:

```mdx id="dy59j0"
---
title: "Título del post"
description: "Descripción breve"
pubDate: AAAA-MM-DD

tags:
  - quantum information
  - conferences

heroImage: "./imagen.png"
---

Contenido de la publicación.
```

Subir las imágenes directamente dentro de la misma carpeta.

---

# Modificar proyectos y líneas de investigación

La información sobre proyectos y líneas de investigación se encuentra en:

[`src/data/projects.json`](https://github.com/guido-b/quicc-website/blob/main/src/data/projects.json)

Allí se pueden modificar:
* líneas de investigación
* actividades principales
* descripciones
* títulos

Es importante conservar correctamente la estructura JSON.

---

# Modificar integrantes del grupo

La información de los integrantes se encuentra en:

[`src/data/authors.json`](https://github.com/guido-b/quicc-website/blob/main/src/data/authors.json)

Allí pueden modificarse:
* nombres
* biografías
* afiliaciones
* enlaces
* correos electrónicos

## Categorías y secciones de la página Team

El campo `category` de cada integrante decide en qué sección aparece:

| `category` | Sección | Tarjeta |
|---|---|---|
| `researcher` | Researchers | grande, con foto |
| `phd` | PhD Students | grande, con foto |
| `masters` | Master's Students | grande, con foto |
| `collaborator` | Collaborators | chica |
| `former` | Former Members | chica |

* Dentro de cada sección, el orden lo da `sortOrder` (de menor a mayor).
* Las secciones sin integrantes no se muestran.
* Si se escribe una categoría que no está en la tabla, el sitio **no se publica** y el error en [`Actions`](https://github.com/quicc-icc/quicc-website/actions) indica qué integrante tiene la categoría mal escrita. Mientras tanto queda publicada la versión anterior.
* Para pasar a alguien a otra sección (por ejemplo, al terminar la maestría) alcanza con cambiar `category` y, si corresponde, `role` y `sortOrder`.

Campo opcional `affiliation`: en las tarjetas chicas (Collaborators y Former Members) se muestra la afiliación si está completa; si está vacía se muestra el rol, salvo "Former Member", que no se muestra. Ejemplo:

```json
"affiliation": "Universidad Nacional de La Plata",
```

Otros campos opcionales:

* `program`: la carrera de los estudiantes (`"Computer Science"`, `"Physics"`, `"Mathematics"`). En la tarjeta se muestra en lugar del rol, y en la ventana queda "PhD Student in Computer Science".
* `degree`: título, por ejemplo `"PhD in Mathematics"`.
* `positions`: lista de cargos, uno por línea.
* `keywords`: tres o cuatro palabras clave de su investigación.

Estos tres últimos se muestran en la ventana que se abre al tocar la tarjeta. Ejemplo:

```json
"degree": "PhD in Computer Science",
"positions": [
  "Researcher at ICC, UBA-CONICET",
  "Professor at the Department of Computer Science, FCEyN, UBA"
],
"keywords": ["Computability theory", "Algorithmic randomness", "Quantum information"],
```

Los correos se escriben con " at " en lugar de "@" (por ejemplo `"usuario at dc.uba.ar"`); el sitio arma el enlace correctamente.

Las imágenes de los integrantes se encuentran en:

[`src/assets/team/`](https://github.com/guido-b/quicc-website/tree/main/src/assets/team)

Si se agrega una nueva imagen:
1. Subirla a `src/assets/team/`
2. Registrarla en:

[`src/data/teamImages.ts`](https://github.com/guido-b/quicc-website/blob/main/src/data/teamImages.ts)

---

# Publicaciones

La página de publicaciones se sincroniza automáticamente desde dos fuentes, para cada integrante listado en [`src/data/orcids.json`](https://github.com/quicc-icc/quicc-website/blob/main/src/data/orcids.json):

1. **ORCID**: los trabajos cargados en el perfil de cada persona.
2. **arXiv**: los artículos de la cuenta de arXiv de cada persona, **sólo si vinculó su ORCID en arXiv**. Así entran los preprints que todavía no se publicaron en una revista.

Cuando un preprint ya se publicó, se muestra una sola vez: la versión de la revista, con el link a arXiv.

## Cómo vincular tu ORCID en arXiv (una sola vez)

1. Entrá a [arxiv.org](https://arxiv.org) con tu usuario y abrí tu página de usuario.
2. Elegí **Link ORCID iD** y autorizá el acceso.
3. Si hay artículos tuyos que subió otra persona, reclamalos desde la misma página (**Claim ownership**).

Para comprobarlo, abrí `https://arxiv.org/a/TU-ORCID` (por ejemplo, `https://arxiv.org/a/0000-0001-8213-8270`): tiene que mostrar tu lista de artículos.

Cuando un preprint se publica con otro título, el sitio no puede saber que es el mismo trabajo. Para que se unan, cargá el DOI de la revista en arXiv: desde tu página de usuario, en el artículo, **Add journal ref and DOI** (no hace falta subir una versión nueva).

## Excluir una publicación

Si algo no debería aparecer (un homónimo, un trabajo que no corresponde), agregá su DOI, su número de arXiv o su título exacto a [`src/data/publications-exclude.json`](https://github.com/quicc-icc/quicc-website/blob/main/src/data/publications-exclude.json). Por ejemplo:

```json
["10.1000/xyz123", "2309.12399", "Título exacto del trabajo"]
```

La información generada se almacena en:

[`src/data/publications.json`](https://github.com/quicc-icc/quicc-website/blob/main/src/data/publications.json)

Ese archivo se actualiza automáticamente mediante GitHub Actions, por lo que normalmente no debe editarse manualmente.

La actualización corre todos los lunes de madrugada. Si encuentra publicaciones nuevas, las guarda y vuelve a publicar el sitio solo. Para forzarla en cualquier momento: [`Actions`](https://github.com/quicc-icc/quicc-website/actions) → **Update Publications** → **Run workflow**.

---

# Publicación automática del sitio

El sitio se publica automáticamente mediante GitHub Pages luego de cada commit realizado en la rama `main`.

Si un cambio rompe la compilación (por ejemplo, un JSON mal cerrado), el sitio **no** se cae: queda publicada la versión anterior hasta que se corrija el error. Quien hizo el cambio recibe un mail de GitHub avisando de la falla.

En los pull requests, el sitio se compila automáticamente para detectar errores antes de aceptar los cambios.

El estado de compilación y publicación puede verse en:

[`Actions`](https://github.com/quicc-icc/quicc-website/actions)

---

# Editar directamente desde GitHub

Para cambios pequeños, el flujo más simple es:
1. Abrir el archivo en GitHub
2. Hacer click en ✏️ **Edit**
3. Modificar el contenido
4. Presionar **Commit changes**

No es necesario instalar nada localmente.

---

# Desarrollo local (opcional)

Para modificaciones más avanzadas:

```bash id="h56x1b"
npm install
npm run dev
```

Para compilar la versión final:

```bash id="gq0f7m"
npm run build
```

---

# Estructura general del repositorio

```text id="yb5k3x"
src/
 ├── content/
 │    └── blog/
 │
 ├── data/
 │    ├── authors.json
 │    ├── projects.json
 │    ├── publications.json
 │    └── teamImages.ts
 │
 ├── assets/
 │    └── team/
```

---

# Contacto

Ante dudas técnicas o problemas con el sitio, contactar a los administradores del repositorio.