import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  updateBackground() {
    const containUser = this.entries.length > 0
    const emptyUser = document.querySelector('.empty-user')
    if (containUser) {
      emptyUser.classList.add('hide')
    } else {
      emptyUser.classList.remove('hide')
    }
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favs:')) || []
  }

  save() {
    localStorage.setItem('@github-favs:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userAlredyExists = this.entries.find(
        entry => entry.login === username
      )
      if (userAlredyExists) {
        throw new Error(
          `O usuário ${username} já foi adicionado anteriormente.`
        )
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error(
          `Usuário ${username} não encontrado! Verifique e tente novamente.`
        )
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onadd()
  }

  onadd() {
    const favoriteButton = this.root.querySelector('.search button')

    favoriteButton.onclick = () => {
      const input = this.root.querySelector('.search input')
      this.add(input.value)
      input.value = ''
    }

    document.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        favoriteButton.click()
      }
    })
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`

      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login

      row.querySelector('.repositories').textContent = user.public_repos

      row.querySelector('.followers').textContent = user.followers

      this.tbody.append(row)

      row.querySelector('.remove').onclick = () => {
        const iWantRemove = confirm(
          `Tem certeza que deseja remover ${user.name} dos favoritos?`
        )

        if (iWantRemove) {
          this.delete(user)
        }
      }
    })
    this.updateBackground()
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
    <td class="user">
    <img
      src="https://github.com/araujodai.png"
      alt="Imagem de Daiane Araujo"
    />
    <a href="https://github.com/araujodai" target="_blank">
      <p>Daiane Araújo</p>
      <span>araujodai</span>
    </a>
  </td>
  <td class="repositories">7</td>
  <td class="followers">43</td>
  <td>
    <button class="remove">Remover</button>
  </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
