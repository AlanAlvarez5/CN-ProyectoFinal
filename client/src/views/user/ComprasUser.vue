<template>
  <v-container>  
    <v-row>
      <p class="display-1 white--text ml-3">Mis Compras</p>
    </v-row>
    <v-data-table
            :headers="headers"
            :items="getAllComprasUser" 
            sort-by="id"
            class="elevation-1"
            :loading="tableLoading"
            :search="search"
    >
      <template v-slot:item.estado="{ item }">
        <v-chip :color="getColor(item.estado)" dark>{{ item.estado }}</v-chip>
      </template>
      <template v-slot:top>
        <v-toolbar flat color="transparent" height="130px">
          <v-row justify="space-between">
            <v-col cols="12" md="6">
              <v-text-field
                      clearable
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Buscar"
                      single-line
                      hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-dialog  v-model="dialog" max-width="850px">
            <form @submit.prevent="save">
              <v-card class="px-3 py-2">
              <v-row>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-spacer></v-spacer>
                  <v-card-actions  v-if="showDetails">
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialog = false">Volver</v-btn>
                  </v-card-actions>
              </v-row>
                <v-card-text>
                  <v-container v-if="showDetails">
                      <v-col class="pl-0">
                        <v-data-table
                          hide-default-footer
                          :headers="detailHeaders"
                          :items="getAllDetallesFromCompra" 
                          sort-by="product_id"
                          class="elevation-1"
                          :loading="tableLoading"
                          :search="search"
                        >
                          <template v-slot:item.imagen="{ item }">
                            <img :src=item.imagen style="width: 100px; height: auto" />
                          </template>
                        </v-data-table>
                      </v-col>
                  </v-container>
                </v-card-text>
             </v-card>
            </form>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon small v-on="on" class="mr-2" @click="showItem(item)" >mdi-eye</v-icon>
          </template>
          <span>Detalles</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex';
  export default {
    data: () => ({
      dialog: false,
      showCompraId: null,
      deleteLoading: false,
      search: '',
      headers: [
        {
          text: 'Id Compra',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Total', value: 'total' },
        { text: 'Fecha', value: 'fecha_hora'},
        { text: 'Estado', value: 'estado'},
        { text: 'Acciones', value: 'actions', sortable: false },
      ],
      detailHeaders: [
        {
          text: 'Id Producto',
          align: 'start',
          sortable: false,
          value: 'producto_id',
        },
        { text: 'Cantidad', value: 'cantidad' },
        { text: 'Nombre', value: 'nombre' },
        { text: 'Marca', value: 'marca' },
        { text: 'Precio Unitario', value: 'precio' },
        { text: 'Total', value: 'total' },
        { text: 'Imagen', value: 'imagen' },
      ],
      tableLoading: false,
      saveLoading: false,
      showDetails: false,
      formTitle: '',
      estados: ['Proceso','Enviado', 'Completado'],
    }),
    computed: {
      ...mapGetters(['getAllComprasUser','getAllDetallesFromCompra','getIdUser']),
    },
    methods: {
      getColor (estado){
        if (estado == 'Proceso') return 'orange'
        else if (estado == 'Enviado') return 'blue'
        else  return 'green'
      },
      ...mapActions(['loadComprasUser','loadDetalleCompra']),
      async showItem(item) {
        this.showCompraId = item.id
        this.showDetails = true;
        await this.loadDetalleCompra(this.showCompraId);
        this.formTitle = 'Detalle de Compra';
        this.dialog = true;
      },
    },
    async created() {
      this.tableLoading = true;
      await this.loadComprasUser(this.getIdUser);
      this.tableLoading = false;
    }
  }
</script>